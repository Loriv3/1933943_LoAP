"""
Converter — TEST MODE
Invece di pubblicare su ActiveMQ, scrive tutto su file JSON per debug.

Output:
  - output_sensors.jsonl   → un evento per riga (sensori + telemetry)
  - output_actuators.jsonl → un evento per riga (attuatori)
"""

import asyncio
import json
import logging
from pathlib import Path

from normalizers.normalizers import normalize
from clients.clients import poll_sensors, subscribe_all_topics, fetch_all_actuators
from schema import UnifiedEvent, ActuatorEvent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger("converter.test")

POLL_INTERVAL = 5.0

# ─── File writers ─────────────────────────────────────────────────────────────

SENSORS_FILE   = Path("output_sensors.jsonl")
ACTUATORS_FILE = Path("output_actuators.jsonl")

def write_sensor_event(event: UnifiedEvent):
    with SENSORS_FILE.open("a") as f:
        f.write(json.dumps(event.to_dict()) + "\n")
    logger.info(f"[sensors] {event.group_id} | status={event.status}")

def write_actuator_event(event: ActuatorEvent):
    with ACTUATORS_FILE.open("a") as f:
        f.write(json.dumps(event.to_dict()) + "\n")
    logger.info(f"[actuators] {event.actuator_id} | is_on={event.is_on}")

# ─── Event handlers ───────────────────────────────────────────────────────────

async def on_sensor_event(schema: str, payload: dict):
    try:
        event = normalize(schema, payload)
        write_sensor_event(event)
    except Exception as e:
        logger.error(f"Normalization error [{schema}]: {e} — payload: {payload}")

# ─── Boot actuators ───────────────────────────────────────────────────────────

async def boot_actuators():
    logger.info("Boot: fetching initial actuator states...")
    actuators = await fetch_all_actuators()
    for payload in actuators:
        try:
            event = normalize("actuator.state.v1", payload)
            write_actuator_event(event)
        except Exception as e:
            logger.error(f"Boot actuator error: {e}")
    logger.info(f"Boot: written {len(actuators)} actuator states to {ACTUATORS_FILE}")

# ─── Main ─────────────────────────────────────────────────────────────────────

async def main():
    logger.info("=== CONVERTER TEST MODE ===")
    logger.info(f"Sensors   → {SENSORS_FILE.resolve()}")
    logger.info(f"Actuators → {ACTUATORS_FILE.resolve()}")

    SENSORS_FILE.unlink(missing_ok=True)
    ACTUATORS_FILE.unlink(missing_ok=True)

    await boot_actuators()

    logger.info("Starting sensor polling and telemetry streams (Ctrl+C to stop)...")
    await asyncio.gather(
        poll_sensors(on_sensor_event, interval=POLL_INTERVAL),
        subscribe_all_topics(on_sensor_event),
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Stopped.")