"""
Normalizers — v2.
Ogni normalizer riceve il payload grezzo e restituisce un UnifiedEvent
con il nuovo schema: group_id + metrics[].id + metrics[].type
"""

from schema import UnifiedEvent, ActuatorEvent, Metric, MetricValue, metric, metricArr


# ─── REST Sensors ─────────────────────────────────────────────────────────────

def normalize_rest_scalar_temperature(payload: dict) -> UnifiedEvent:
    return UnifiedEvent(
        group_id="greenhouse",
        at=payload["captured_at"],
        status=payload.get("status", None),
        metrics=[metric("temperature", "thermal.temperature", payload["value"], payload["unit"])],
    )

def normalize_rest_scalar_humidity(payload: dict) -> UnifiedEvent:
    return UnifiedEvent(
        group_id="entrance",
        at=payload["captured_at"],
        status=payload.get("status", None),
        metrics=[metric("humidity", "thermal.humidity", payload["value"], payload["unit"])],
    )

def normalize_rest_scalar_co2(payload: dict) -> UnifiedEvent:
    return UnifiedEvent(
        group_id="hall",
        at=payload["captured_at"],
        status=payload.get("status", None),
        metrics=[metric("co2", "air_quality.particle_volume_concentration", payload["value"], payload["unit"])],
    )

def normalize_rest_scalar_pressure(payload: dict) -> UnifiedEvent:
    return UnifiedEvent(
        group_id="corridor",
        at=payload["captured_at"],
        status=payload.get("status", None),
        metrics=[metric("pressure", "environment.pressure", payload["value"], payload.get("unit", ""))],
    )

def normalize_rest_chemistry_ph(payload: dict) -> UnifiedEvent:
    measurements = payload.get("measurements", [])
    return UnifiedEvent(
        group_id="hydroponics",
        at=payload["captured_at"],
        status=payload.get("status", None),
        metrics=[
            metric(m["metric"], "chemistry.ph", m["value"], m["unit"])
            for m in measurements
        ],
    )

def normalize_rest_chemistry_voc(payload: dict) -> UnifiedEvent:
    measurements = payload.get("measurements", [])
    return UnifiedEvent(
        group_id="air_quality_voc_co2e",
        at=payload["captured_at"],
        status=payload.get("status", None),
        metrics=[
            metric(m["metric"], "air_quality.particle_volume_concentration", m["value"], m["unit"])
            for m in measurements
        ],
    )

def normalize_rest_particulate(payload: dict) -> UnifiedEvent:
    return UnifiedEvent(
        group_id="air_quality_pm1_pm10_pm25",
        at=payload["captured_at"],
        status=payload.get("status", None),
        metrics=[
            metric("pm1",  "air_quality.mass_volume_concentration", payload["pm1_ug_m3"],  "ug/m3"),
            metric("pm25", "air_quality.mass_volume_concentration", payload["pm25_ug_m3"], "ug/m3"),
            metric("pm10", "air_quality.mass_volume_concentration", payload["pm10_ug_m3"], "ug/m3"),
        ],
    )

def normalize_rest_water_level(payload: dict) -> UnifiedEvent:
    return UnifiedEvent(
        group_id="water_tank",
        at=payload["captured_at"],
        status=payload.get("status", None),
        metrics=[metricArr(
            "level",
            "water.level",
            [payload["level_liters"], payload["level_pct"]],
            ["L", "%"]
        )],
    )


# ─── Telemetry Topics ─────────────────────────────────────────────────────────

def normalize_topic_power(payload: dict) -> UnifiedEvent:
    subsystem = payload.get("subsystem", None)
    return UnifiedEvent(
        group_id=f"power.{subsystem}",
        at=payload["event_time"],
        status="ok",
        metrics=[
            metric("power",      "power.power",            payload["power_kw"],       "kW"),
            metric("voltage",    "power.voltage",          payload["voltage_v"],      "V"),
            metric("current",    "power.current",          payload["current_a"],      "A"),
            metric("cumulative", "power.cumulative_power", payload["cumulative_kwh"], "kWh"),
        ],
    )

def normalize_topic_environment(payload: dict) -> UnifiedEvent:
    source = payload.get("source", {})
    system = source.get("system", None)
    metrics = []
    for m in payload["measurements"]:
        if m["metric"] == "radiation_uSv_h":
            metrics.append(metric("radiation", "environment.radiation", m["value"], m["unit"]))
        elif m["metric"] == "oxygen_percent":
            metrics.append(metric("oxygen",    "environment.oxygen",    m["value"], m["unit"]))
    return UnifiedEvent(
        group_id=f"environment.{system}",
        at=payload["event_time"],
        status=payload.get("status", None),
        metrics=metrics,
    )

def normalize_topic_thermal_loop(payload: dict) -> UnifiedEvent:
    return UnifiedEvent(
        group_id="thermal_loop",
        at=payload["event_time"],
        status=payload.get("status", None),
        metrics=[
            metric("temperature", "thermal.temperature", payload["temperature_c"], "C"),
            metric("flow",        "thermal.flow",        payload["flow_l_min"],    "L/min"),
        ],
    )

def normalize_topic_airlock(payload: dict) -> UnifiedEvent:
    return UnifiedEvent(
        group_id="airlock",
        at=payload["event_time"],
        status="ok",
        metrics=[
            metric("cycles_per_hour", "airlock.cycles_per_hour", payload["cycles_per_hour"],    "cyc/h"),
            metric("state",           "airlock.state",           payload["last_state"].lower(), ""),
        ],
    )


# ─── Actuators ────────────────────────────────────────────────────────────────

def normalize_actuator(payload: dict) -> ActuatorEvent:
    return ActuatorEvent(
        actuator_id=payload["actuator_id"],
        is_on=payload["is_on"],
        updated_at=payload.get("updated_at") or ActuatorEvent.now_iso(),
    )


# ─── Registry ─────────────────────────────────────────────────────────────────
# Per i sensori scalari serve distinguere per sensor_id, non solo per schema.
# La chiave può essere sia "schema" (per i topic) che "sensor_id" (per i REST scalari).

SENSOR_ID_NORMALIZERS: dict[str, callable] = {
    "greenhouse_temperature": normalize_rest_scalar_temperature,
    "entrance_humidity":      normalize_rest_scalar_humidity,
    "co2_hall":               normalize_rest_scalar_co2,
    "corridor_pressure":      normalize_rest_scalar_pressure,
    "hydroponic_ph":          normalize_rest_chemistry_ph,
    "air_quality_voc":        normalize_rest_chemistry_voc,
    "air_quality_pm25":       normalize_rest_particulate,
    "water_tank_level":       normalize_rest_water_level,
}

SCHEMA_NORMALIZERS: dict[str, callable] = {
    "topic.power.v1":        normalize_topic_power,
    "topic.environment.v1":  normalize_topic_environment,
    "topic.thermal_loop.v1": normalize_topic_thermal_loop,
    "topic.airlock.v1":      normalize_topic_airlock,
    "actuator.state.v1":     normalize_actuator,
}


def normalize(schema: str, payload: dict) -> UnifiedEvent:
    """
    Entry point unico.
    Per i REST sensor usa sensor_id come chiave (più specifico).
    Per telemetry e actuator usa lo schema.
    """
    # Prova prima per sensor_id (REST sensors)
    sensor_id = payload.get("sensor_id")
    if sensor_id and sensor_id in SENSOR_ID_NORMALIZERS:
        return SENSOR_ID_NORMALIZERS[sensor_id](payload)

    # Poi per schema (telemetry + actuator)
    normalizer = SCHEMA_NORMALIZERS.get(schema)
    if normalizer:
        return normalizer(payload)

    raise ValueError(f"No normalizer found for schema='{schema}', sensor_id='{sensor_id}'")
