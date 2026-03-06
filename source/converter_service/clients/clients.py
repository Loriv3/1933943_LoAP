"""
Clients — REST poller e SSE subscriber.
Ogni client emette payload grezzi + schema string verso il Converter core.
"""

import asyncio
import json
import logging
import httpx
import os

logger = logging.getLogger(__name__)

BASE_URL = os.getenv("BACKEND_URL", "http://localhost:8080")

# Mappa sensor_id → schema family (da SCHEMA_CONTRACT.md)
SENSOR_SCHEMA_MAP: dict[str, str] = {
    "greenhouse_temperature": "rest.scalar.v1",
    "entrance_humidity":      "rest.scalar.v1",
    "co2_hall":               "rest.scalar.v1",
    "corridor_pressure":      "rest.scalar.v1",
    "hydroponic_ph":          "rest.chemistry.v1",
    "air_quality_voc":        "rest.chemistry.v1",
    "water_tank_level":       "rest.level.v1",
    "air_quality_pm25":       "rest.particulate.v1",
}

# Mappa topic → schema family
TOPIC_SCHEMA_MAP: dict[str, str] = {
    "mars/telemetry/solar_array":       "topic.power.v1",
    "mars/telemetry/power_bus":         "topic.power.v1",
    "mars/telemetry/power_consumption": "topic.power.v1",
    "mars/telemetry/radiation":         "topic.environment.v1",
    "mars/telemetry/life_support":      "topic.environment.v1",
    "mars/telemetry/thermal_loop":      "topic.thermal_loop.v1",
    "mars/telemetry/airlock":           "topic.airlock.v1",
}


# ─── REST Sensor Poller ───────────────────────────────────────────────────────

async def poll_sensors(on_event, interval: float = 5.0):
    """
    Polling continuo di tutti i sensori REST.
    on_event(schema, payload) viene chiamato per ogni lettura.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            for sensor_id, schema in SENSOR_SCHEMA_MAP.items():
                try:
                    r = await client.get(f"{BASE_URL}/api/sensors/{sensor_id}")
                    r.raise_for_status()
                    payload = r.json()
                    await on_event(schema, payload)
                    logger.debug(f"Polled {sensor_id}")
                except Exception as e:
                    logger.warning(f"Failed to poll {sensor_id}: {e}")
            await asyncio.sleep(interval)


# ─── SSE Telemetry Subscriber ─────────────────────────────────────────────────

async def subscribe_sse_topic(topic: str, schema: str, on_event):
    """
    Sottoscrizione SSE a un singolo topic.
    Riconnette automaticamente in caso di errore.
    """
    url = f"{BASE_URL}/api/telemetry/stream/{topic}"
    while True:
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("GET", url) as response:
                    response.raise_for_status()
                    logger.info(f"SSE connected: {topic}")
                    async for line in response.aiter_lines():
                        if line.startswith("data:"):
                            raw = line[5:].strip()
                            if raw:
                                payload = json.loads(raw)
                                await on_event(schema, payload)
        except Exception as e:
            logger.warning(f"SSE {topic} disconnected: {e}. Reconnecting in 5s...")
            await asyncio.sleep(5)


async def subscribe_all_topics(on_event):
    """Avvia una task SSE per ogni topic."""
    tasks = [
        subscribe_sse_topic(topic, schema, on_event)
        for topic, schema in TOPIC_SCHEMA_MAP.items()
    ]
    await asyncio.gather(*tasks)


# ─── Actuator Fetcher ─────────────────────────────────────────────────────────

async def fetch_all_actuators() -> list[dict]:
    """
    Chiamato una volta al boot.
    Restituisce lista di payload normalizzabili (uno per attuatore).
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{BASE_URL}/api/actuators")
        r.raise_for_status()
        data = r.json()
        # data = {"actuators": {"cooling": "ON", "heating": "OFF", ...}}
        actuators = data.get("actuators", {})
        return [
            {"actuator": name, "state": state, "updated_at": None}
            for name, state in actuators.items()
        ]


async def update_actuator(actuator_id: str, new_state: str) -> dict:
    """
    Chiamato quando arriva un comando dall'Automation Engine.
    Chiama la REST API e restituisce il payload aggiornato.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            f"{BASE_URL}/api/actuators/{actuator_id}",
            json={"state": new_state}
        )
        r.raise_for_status()
        return r.json()  # {"actuator": ..., "state": ..., "updated_at": ...}