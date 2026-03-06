"""
Normalizers — one per schema family.
Each normalizer receives the raw payload (dict) and returns a UnifiedEvent.
"""

from schema import UnifiedEvent, Measurement

# ─── REST Sensors ─────────────────────────────────────────────────────────────

def normalize_rest_scalar(payload: dict) -> UnifiedEvent:
    """rest.scalar.v1 — greenhouse_temperature, entrance_humidity, co2_hall, corridor_pressure"""
    return UnifiedEvent(
        source_type="rest_sensor",
        source_schema="rest.scalar.v1",
        source_id=payload["sensor_id"],
        timestamp=payload["captured_at"],
        status=payload.get("status", "unknown"),
        measurements=[
            Measurement(
                metric=payload["metric"],
                value=payload["value"],
                unit=payload.get("unit", ""),
            )
        ],
    )


def normalize_rest_chemistry(payload: dict) -> UnifiedEvent:
    """rest.chemistry.v1 — hydroponic_ph, air_quality_voc"""
    return UnifiedEvent(
        source_type="rest_sensor",
        source_schema="rest.chemistry.v1",
        source_id=payload["sensor_id"],
        timestamp=payload["captured_at"],
        status=payload.get("status", "unknown"),
        measurements=[
            Measurement(metric=m["metric"], value=m["value"], unit=m.get("unit", ""))
            for m in payload.get("measurements", [])
        ],
    )


def normalize_rest_particulate(payload: dict) -> UnifiedEvent:
    """rest.particulate.v1 — air_quality_pm25"""
    return UnifiedEvent(
        source_type="rest_sensor",
        source_schema="rest.particulate.v1",
        source_id=payload["sensor_id"],
        timestamp=payload["captured_at"],
        status=payload.get("status", "unknown"),
        measurements=[
            Measurement(metric="pm1",  value=payload["pm1_ug_m3"],  unit="ug/m3"),
            Measurement(metric="pm25", value=payload["pm25_ug_m3"], unit="ug/m3"),
            Measurement(metric="pm10", value=payload["pm10_ug_m3"], unit="ug/m3"),
        ],
    )


def normalize_rest_level(payload: dict) -> UnifiedEvent:
    """rest.level.v1 — water_tank_level"""
    return UnifiedEvent(
        source_type="rest_sensor",
        source_schema="rest.level.v1",
        source_id=payload["sensor_id"],
        timestamp=payload["captured_at"],
        status=payload.get("status", "unknown"),
        measurements=[
            Measurement(metric="level_pct",    value=payload["level_pct"],    unit="%"),
            Measurement(metric="level_liters", value=payload["level_liters"], unit="L"),
        ],
    )


# ─── Telemetry Topics ─────────────────────────────────────────────────────────

def normalize_topic_power(payload: dict) -> UnifiedEvent:
    """topic.power.v1 — solar_array, power_bus, power_consumption"""
    return UnifiedEvent(
        source_type="telemetry",
        source_schema="topic.power.v1",
        source_id=payload["topic"],
        timestamp=payload["event_time"],
        status="ok",
        measurements=[
            Measurement(metric="power_kw",       value=payload["power_kw"],       unit="kW"),
            Measurement(metric="voltage_v",      value=payload["voltage_v"],      unit="V"),
            Measurement(metric="current_a",      value=payload["current_a"],      unit="A"),
            Measurement(metric="cumulative_kwh", value=payload["cumulative_kwh"], unit="kWh"),
        ],
    )


def normalize_topic_environment(payload: dict) -> UnifiedEvent:
    """topic.environment.v1 — radiation, life_support"""
    source = payload.get("source", {})
    source_id = payload["topic"]
    return UnifiedEvent(
        source_type="telemetry",
        source_schema="topic.environment.v1",
        source_id=source_id,
        timestamp=payload["event_time"],
        status=payload.get("status", "unknown"),
        measurements=[
            Measurement(metric=m["metric"], value=m["value"], unit=m.get("unit", ""))
            for m in payload.get("measurements", [])
        ],
    )


def normalize_topic_thermal_loop(payload: dict) -> UnifiedEvent:
    """topic.thermal_loop.v1 — thermal_loop"""
    return UnifiedEvent(
        source_type="telemetry",
        source_schema="topic.thermal_loop.v1",
        source_id=payload["topic"],
        timestamp=payload["event_time"],
        status=payload.get("status", "unknown"),
        measurements=[
            Measurement(metric="temperature_c", value=payload["temperature_c"], unit="°C"),
            Measurement(metric="flow_l_min",    value=payload["flow_l_min"],    unit="L/min"),
        ],
    )


def normalize_topic_airlock(payload: dict) -> UnifiedEvent:
    """topic.airlock.v1 — airlock"""
    return UnifiedEvent(
        source_type="telemetry",
        source_schema="topic.airlock.v1",
        source_id=payload["topic"],
        timestamp=payload["event_time"],
        status="ok",
        measurements=[
            Measurement(metric="cycles_per_hour", value=payload["cycles_per_hour"], unit="cycles/h"),
            Measurement(metric="last_state",      value=payload["last_state"],      unit=""),
        ],
    )


# ─── Actuators ────────────────────────────────────────────────────────────────

def normalize_actuator(payload: dict) -> UnifiedEvent:
    """actuator.state.v1 — risposta di GET/POST /api/actuators/{id}"""
    return UnifiedEvent(
        source_type="actuator",
        source_schema="actuator.state.v1",
        source_id=payload["actuator"],
        timestamp=payload.get("updated_at", UnifiedEvent.now_iso()),
        status=payload["state"],   # "ON" | "OFF"
        measurements=[],
    )


# ─── Registry ─────────────────────────────────────────────────────────────────
# Mappa schema → funzione normalizzatrice

NORMALIZER_REGISTRY: dict[str, callable] = {
    "rest.scalar.v1":        normalize_rest_scalar,
    "rest.chemistry.v1":     normalize_rest_chemistry,
    "rest.particulate.v1":   normalize_rest_particulate,
    "rest.level.v1":         normalize_rest_level,
    "topic.power.v1":        normalize_topic_power,
    "topic.environment.v1":  normalize_topic_environment,
    "topic.thermal_loop.v1": normalize_topic_thermal_loop,
    "topic.airlock.v1":      normalize_topic_airlock,
    "actuator.state.v1":     normalize_actuator,
}


def normalize(schema: str, payload: dict) -> UnifiedEvent:
    """Entry point unico — riceve schema e payload grezzo, restituisce UnifiedEvent."""
    normalizer = NORMALIZER_REGISTRY.get(schema)
    if not normalizer:
        raise ValueError(f"Unknown schema: {schema}")
    return normalizer(payload)