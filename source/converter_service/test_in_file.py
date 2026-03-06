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
from datetime import datetime
from pathlib import Path

from normalizers.normalizers import normalize
from clients.clients import poll_sensors, subscribe_all_topics, fetch_all_actuators
from schema import UnifiedEvent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger("converter.test")

POLL_INTERVAL = 5.0

# ─── File writer ──────────────────────────────────────────────────────────────

SENSORS_FILE   = Path("output_sensors.jsonl")
ACTUATORS_FILE = Path("output_actuators.jsonl")

def write_event(filepath: Path, event: UnifiedEvent):
    with filepath.open("a") as f:
        f.write(json.dumps(event.to_dict()) + "\n")
    logger.info(f"[{filepath.name}] {event.source_type} | {event.source_id} | status={event.status}")

# ─── Event handlers ───────────────────────────────────────────────────────────

async def on_sensor_event(schema: str, payload: dict):
    try:
        event = normalize(schema, payload)
        write_event(SENSORS_FILE, event)
    except Exception as e:
        logger.error(f"Normalization error [{schema}]: {e} — payload: {payload}")

# ─── Boot actuators ───────────────────────────────────────────────────────────

async def boot_actuators():
    logger.info("Boot: fetching initial actuator states...")
    actuators = await fetch_all_actuators()
    for payload in actuators:
        try:
            event = normalize("actuator.state.v1", payload)
            write_event(ACTUATORS_FILE, event)
        except Exception as e:
            logger.error(f"Boot actuator error: {e}")
    logger.info(f"Boot: written {len(actuators)} actuator states to {ACTUATORS_FILE}")

# ─── Main ─────────────────────────────────────────────────────────────────────

async def main():
    logger.info("=== CONVERTER TEST MODE ===")
    logger.info(f"Sensors  → {SENSORS_FILE.resolve()}")
    logger.info(f"Actuators → {ACTUATORS_FILE.resolve()}")

    # Pulisce i file precedenti ad ogni run
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