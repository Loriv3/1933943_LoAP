"""
Converter — PRODUCTION MODE
Pubblica su ActiveMQ Artemis via STOMP.

Flusso:
  BOOT:    fetch tutti gli attuatori → pubblica stato iniziale su actuator.commands
  RUNTIME: polling REST sensors + SSE telemetry → pubblica su sensor.events
           comandi in arrivo su actuator.commands → chiama REST API → pubblica update
"""

import asyncio
import json
import logging
import os
import stomp

from normalizers.normalizers import normalize
from clients.clients import poll_sensors, subscribe_all_topics, fetch_all_actuators, update_actuator
from amq.amq_publisher import AMQPublisher
from schema import UnifiedEvent, ActuatorEvent

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger("converter")

# ─── Config da environment ────────────────────────────────────────────────────

AMQ_HOST      = os.getenv("AMQ_HOST", "localhost")
AMQ_PORT      = int(os.getenv("AMQ_PORT", "61616"))
POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "5.0"))

COMMANDS_QUEUE = "actuator.commands"

# ─── Publisher globale ────────────────────────────────────────────────────────

publisher = AMQPublisher(host=AMQ_HOST, port=AMQ_PORT)

# ─── Event handlers ───────────────────────────────────────────────────────────

async def on_sensor_event(schema: str, payload: dict):
    try:
        event: UnifiedEvent = normalize(schema, payload)
        publisher.publish_sensor(event)
    except Exception as e:
        logger.error(f"Normalization error [{schema}]: {e} — payload: {payload}")


async def on_actuator_command(actuator_id: str, is_on: bool):
    """Riceve un comando, chiama la REST API, pubblica il nuovo stato."""
    try:
        new_state = "ON" if is_on else "OFF"
        payload = await update_actuator(actuator_id, new_state)
        event: ActuatorEvent = normalize("actuator.state.v1", payload)
        publisher.publish_actuator(event)
        logger.info(f"Actuator [{actuator_id}] → {new_state}")
    except Exception as e:
        logger.error(f"Actuator command error [{actuator_id}]: {e}")

# ─── AMQ Command Listener ─────────────────────────────────────────────────────

class CommandListener(stomp.ConnectionListener):
    """
    Ascolta i comandi in arrivo su actuator.commands.
    Formato atteso: {"actuator_id": "cooling_fan", "is_on": true}
    """
    def __init__(self, loop: asyncio.AbstractEventLoop):
        self.loop = loop

    def on_message(self, frame):
        try:
            cmd = json.loads(frame.body)
            actuator_id = cmd["actuator_id"]
            is_on       = cmd["is_on"]
            asyncio.run_coroutine_threadsafe(
                on_actuator_command(actuator_id, is_on),
                self.loop
            )
        except Exception as e:
            logger.error(f"Invalid command: {e} — body: {frame.body}")

    def on_error(self, frame):
        logger.error(f"AMQ error: {frame}")

    def on_disconnected(self):
        logger.warning("AMQ command listener disconnected")


def setup_command_listener(loop: asyncio.AbstractEventLoop) -> stomp.Connection:
    conn = stomp.Connection([(AMQ_HOST, AMQ_PORT)])
    conn.set_listener("command_listener", CommandListener(loop))
    conn.connect(wait=True)
    conn.subscribe(destination=COMMANDS_QUEUE, id=1, ack="auto")
    logger.info(f"Listening for commands on {COMMANDS_QUEUE}")
    return conn

# ─── Boot actuators ───────────────────────────────────────────────────────────

async def boot_actuators():
    logger.info("Boot: fetching initial actuator states...")
    actuators = await fetch_all_actuators()
    for payload in actuators:
        try:
            event: ActuatorEvent = normalize("actuator.state.v1", payload)
            publisher.publish_actuator(event)
        except Exception as e:
            logger.error(f"Boot actuator error: {e}")
    logger.info(f"Boot: published {len(actuators)} actuator states")

# ─── Main ─────────────────────────────────────────────────────────────────────

async def main():
    logger.info("=== CONVERTER PRODUCTION MODE ===")
    logger.info(f"AMQ:     {AMQ_HOST}:{AMQ_PORT}")
    logger.info(f"Backend: {os.getenv('BACKEND_URL', 'http://localhost:8080')}")

    # 1. Connetti ad ActiveMQ
    publisher.connect()

    # 2. Boot actuators
    await boot_actuators()

    # 3. Setup listener comandi
    loop = asyncio.get_event_loop()
    cmd_conn = setup_command_listener(loop)

    # 4. Polling + SSE in parallelo
    logger.info("Starting sensor polling and telemetry streams...")
    try:
        await asyncio.gather(
            poll_sensors(on_sensor_event, interval=POLL_INTERVAL),
            subscribe_all_topics(on_sensor_event),
        )
    finally:
        cmd_conn.disconnect()
        publisher.disconnect()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Stopped.")
