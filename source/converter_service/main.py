"""
Converter — entry point principale.

Flusso:
  BOOT:    fetch tutti gli attuatori → pubblica stato iniziale su /queue/actuators
  RUNTIME: polling REST sensors + SSE telemetry → pubblica su /queue/sensors
           comandi da Automation Engine (AMQ) → chiama REST API attuatore → pubblica update
"""

import asyncio
import json
import logging
import stomp

from normalizers.normalizers import normalize
from clients.clients import poll_sensors, subscribe_all_topics, fetch_all_actuators, update_actuator
from queue.amq_publisher import AMQPublisher
from schema import UnifiedEvent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger("converter")

# ─── Config ───────────────────────────────────────────────────────────────────

AMQ_HOST     = "localhost"
AMQ_PORT     = 61613
POLL_INTERVAL = 5.0   # secondi tra un poll REST e il successivo

COMMANDS_QUEUE = "/queue/actuator_commands"   # coda su cui ascolta i comandi dall'Automation Engine

# ─── Core event handler ───────────────────────────────────────────────────────

publisher = AMQPublisher(host=AMQ_HOST, port=AMQ_PORT)


async def on_sensor_event(schema: str, payload: dict):
    """Chiamato da poller e SSE per ogni evento grezzo."""
    try:
        event: UnifiedEvent = normalize(schema, payload)
        publisher.publish_sensor(event)
    except Exception as e:
        logger.error(f"Normalization error [{schema}]: {e} — payload: {payload}")


async def on_actuator_update(actuator_id: str, new_state: str):
    """Chiamato quando arriva un comando dall'Automation Engine."""
    try:
        payload = await update_actuator(actuator_id, new_state)
        event: UnifiedEvent = normalize("actuator.state.v1", payload)
        publisher.publish_actuator(event)
        logger.info(f"Actuator [{actuator_id}] updated to {new_state}")
    except Exception as e:
        logger.error(f"Actuator update error [{actuator_id}]: {e}")


# ─── AMQ Command Listener ─────────────────────────────────────────────────────

class CommandListener(stomp.ConnectionListener):
    """
    Ascolta i comandi dall'Automation Engine sulla coda /queue/actuator_commands.
    Formato atteso: {"actuator_id": "cooling", "state": "ON"}
    """
    def __init__(self, loop: asyncio.AbstractEventLoop):
        self.loop = loop

    def on_message(self, frame):
        try:
            cmd = json.loads(frame.body)
            actuator_id = cmd["actuator_id"]
            new_state   = cmd["state"]
            asyncio.run_coroutine_threadsafe(
                on_actuator_update(actuator_id, new_state),
                self.loop
            )
        except Exception as e:
            logger.error(f"Invalid command received: {e} — body: {frame.body}")


def setup_command_listener(loop: asyncio.AbstractEventLoop):
    conn = stomp.Connection([(AMQ_HOST, AMQ_PORT)])
    conn.set_listener("", CommandListener(loop))
    conn.connect(wait=True)
    conn.subscribe(destination=COMMANDS_QUEUE, id=1, ack="auto")
    logger.info(f"Listening for commands on {COMMANDS_QUEUE}")
    return conn


# ─── Boot sequence ────────────────────────────────────────────────────────────

async def boot_actuators():
    """Fetch snapshot iniziale di tutti gli attuatori e pubblica sulla coda."""
    logger.info("Boot: fetching initial actuator states...")
    actuators = await fetch_all_actuators()
    for payload in actuators:
        try:
            event = normalize("actuator.state.v1", payload)
            publisher.publish_actuator(event)
        except Exception as e:
            logger.error(f"Boot actuator error: {e}")
    logger.info(f"Boot: published {len(actuators)} actuator states")


# ─── Main ─────────────────────────────────────────────────────────────────────

async def main():
    # 1. Connetti ad ActiveMQ
    publisher.connect()

    # 2. Boot actuators
    await boot_actuators()

    # 3. Setup listener comandi (thread STOMP separato)
    loop = asyncio.get_event_loop()
    cmd_conn = setup_command_listener(loop)

    # 4. Avvia polling + SSE in parallelo
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
    asyncio.run(main())