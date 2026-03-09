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
import time
from proton.handlers import MessagingHandler
from proton.reactor import Container
import json
import threading

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
BROKER_URL = f"amqp://{AMQ_HOST}:{AMQ_PORT}"
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

from proton.handlers import MessagingHandler
from proton.reactor import Container
import json
import threading

class CommandReceiver(MessagingHandler):
    def __init__(self, broker_url, loop):
        super().__init__()
        self.broker_url = broker_url
        self.loop = loop

    def on_start(self, event):
        conn = event.container.connect(self.broker_url)
        event.container.create_receiver(conn, source="actuator.commands")
        logger.info("[AMQP] Listening on actuator.commands")

    def on_message(self, event):
        try:
            raw = event.message.body
            if isinstance(raw, memoryview):
                raw = raw.tobytes().decode("utf-8")
            elif isinstance(raw, bytes):
                raw = raw.decode("utf-8")
            
            cmd = json.loads(raw)
            logger.info(f"[AMQP] Command received: {cmd}")
            asyncio.run_coroutine_threadsafe(on_actuator_command(cmd["actuator_id"], cmd["is_on"]), self.loop)
        except Exception as e:
            logger.error(f"[AMQP] Error parsing command: {e}")

def start_command_listener(broker_url: str, loop: asyncio.AbstractEventLoop):
    def run():
        while True:
            try:
                container = Container(CommandReceiver(broker_url, loop))
                container.run()
            except Exception as e:
                logger.error(f"[AMQP] Command listener failed: {e} — retrying in 5s")
                time.sleep(5)
    
    threading.Thread(target=run, daemon=True).start()

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
    start_command_listener(BROKER_URL, loop)

    # 4. Polling + SSE in parallelo
    logger.info("Starting sensor polling and telemetry streams...")
    try:
        await asyncio.gather(
            poll_sensors(on_sensor_event, interval=POLL_INTERVAL),
            subscribe_all_topics(on_sensor_event),
        )
    finally:
        
        publisher.disconnect()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Stopped.")
