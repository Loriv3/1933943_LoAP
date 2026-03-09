group_data = {
    "greenhouse": {
        "name": "Greenhouse",
        "metrics": [{
            "metric_id": "temperature",
            "name": "Temperature",
            r"type": "thermal.temperature",
            "unit": ["C"]
        }],
        "has_status": True,
    },
    "entrance": {
        "name": "Entrance",
        "metrics": [{
            "metric_id": "humidity",
            "name": "Humidity",
            r"type": "environment.humidity",
            "unit": ["%"]
        }],
        "has_status": True,
    },
    "hall": {
        "name": "Hall",
        "metrics": [{
            "metric_id": "co2",
            "name": "CO2",
            r"type": "air_quality.particle_volume_concentration",
            "unit": ["ppm"]
        }],
        "has_status": True,
    },
    "corridor": {
        "name": "Corridor",
        "metrics": [{
            "metric_id": "pressure",
            "name": "Pressure",
            r"type": "environment.pressure",
            "unit": ["kPa"]
        }],
        "has_status": True,
    },
    "hydroponics": {
        "name": "Hydroponics",
        "metrics": [{
            "metric_id": "ph",
            "name": "pH",
            r"type": "chemistry.ph",
            "unit": ["pH"]
        }],
        "has_status": True,
    },
    "air_quality_voc_co2e": {
        "name": "Air Quality",
        "subtitle": "VOC/CO2e",
        "metrics": [{
            "metric_id": "voc_ppb",
            "name": "VOC",
            r"type": "air_quality.particle_volume_concentration",
            "unit": ["ppb"]
        }, {
            "metric_id": "co2e_ppm",
            "name": "CO2e",
            r"type": "air_quality.particle_volume_concentration",
            "unit": ["ppm"]
        }],
        "has_status": True,
    },
    "air_quality_pm1_pm10_pm25": {
        "name": "Air Quality",
        "subtitle": "PM1/PM10/PM25",
        "metrics": [{
            "metric_id": "pm1",
            "name": "PM1",
            r"type": "air_quality.mass_volume_concentration",
            "unit": ["ug/m3"]
        }, {
            "metric_id": "pm10",
            "name": "PM10",
            r"type": "air_quality.mass_volume_concentration",
            "unit": ["ug/m3"]
        }, {
            "metric_id": "pm25",
            "name": "PM25",
            r"type": "air_quality.mass_volume_concentration",
            "unit": ["ug/m3"]
        }],
        "has_status": True,
    },
    "water_tank": {
        "name": "Water Tank",
        "metrics": [{
            "metric_id": "level",
            "name": "Level",
            r"type": "water.level",
            "unit": ["L", "%"]
        }],
        "has_status": True,
    },
    "power.solar_array": {
        "name": "Solar Array",
        "metrics": [{
            "metric_id": "power",
            "name": "Power",
            r"type": "power.power",
            "unit": ["kW"]
        }, {
            "metric_id": "cumulative",
            "name": "Cumulative",
            r"type": "power.cumulative_power",
            "unit": ["kWh"]
        }, {
            "metric_id": "voltage",
            "name": "Voltage",
            r"type": "power.voltage",
            "unit": ["V"]
        }, {
            "metric_id": "current",
            "name": "Current",
            r"type": "power.current",
            "unit": ["A"]
        }],
        "has_status": False,
    },
    "power.power_bus": {
        "name": "Power Bus",
        "metrics": [{
            "metric_id": "power",
            "name": "Power",
            r"type": "power.power",
            "unit": ["kW"]
        }, {
            "metric_id": "cumulative",
            "name": "Cumulative",
            r"type": "power.cumulative_power",
            "unit": ["kWh"]
        }, {
            "metric_id": "voltage",
            "name": "Voltage",
            r"type": "power.voltage",
            "unit": ["V"]
        }, {
            "metric_id": "current",
            "name": "Current",
            r"type": "power.current",
            "unit": ["A"]
        }],
        "has_status": False,
    },
    "power.power_consumption": {
        "name": "Power Consumption",
        "metrics": [{
            "metric_id": "power",
            "name": "Power",
            r"type": "power.power",
            "unit": ["kW"]
        }, {
            "metric_id": "cumulative",
            "name": "Cumulative",
            r"type": "power.cumulative_power",
            "unit": ["kWh"]
        }, {
            "metric_id": "voltage",
            "name": "Voltage",
            r"type": "power.voltage",
            "unit": ["V"]
        }, {
            "metric_id": "current",
            "name": "Current",
            r"type": "power.current",
            "unit": ["A"]
        }],
        "has_status": False,
    },
    "environment.radiation-monitor": {
        "name": "Environment",
        "subtitle": "Radiation",
        "metrics": [{
            "metric_id": "radiation",
            "name": "Radiation",
            r"type": "environment.radiation",
            "unit": ["uSv/h"]
        }],
        "has_status": True,
    },
    "environment.life-support": {
        "name": "Environment",
        "subtitle": "Life Support",
        "metrics": [{
            "metric_id": "oxygen",
            "name": "Oxygen",
            r"type": "environment.oxygen",
            "unit": ["%"]
        }],
        "has_status": True,
    },
    "thermal_loop": {
        "name": "Thermal Loop",
        "metrics": [{
            "metric_id": "temperature",
            "name": "Temperature",
            r"type": "thermal.temperature",
            "unit": ["C"]
        }, {
            "metric_id": "flow",
            "name": "Flow",
            r"type": "thermal.flow",
            "unit": ["L/min"]
        }],
        "has_status": True,
    },
    "airlock": {
        "name": "Airlock",
        "metrics": [{
            "metric_id": "cycles_per_hour",
            "name": "Cycles per Hour",
            r"type": "airlock.cycles_per_hour",
            "unit": ["cyc/h"]
        }, {
            "metric_id": "state",
            "name": "State",
            r"type": "airlock.state",
            "unit": [""]
        }],
        "has_status": False,
    },
}
