export const enum MetricType {
    Ph = "chemistry.ph",
    AQParticleVolumeConcentration = "air_quality.particle_volume_concentration",
    AQVolumeVolumeConcentration = "air_quality.volume_volume_concentration",
    AQMassVolumeConcentration = "air_quality.mass_volume_concentration",
    WaterLevel = "water.level",
    Temperature = "thermal.temperature",
    Humidity = "environment.humidity",
    Pressure = "environment.pressure",
    Oxygen = "environment.oxygen",
    CyclesPerHour = "airlock.cycles_per_hour",
    Radiation = "environment.radiation",
    Power = "power.power",
    CumulativePower = "power.cumulative_power",
    Voltage = "power.voltage",
    Current = "power.current",
    Flow = "thermal.flow",
    AirlockState = "airlock.state",
}

export type MetricUnit =
    | "pH"
    | "ppm"
    | "ppb"
    | "%"
    | "ug/m3"
    | "L"
    | "C"
    | "kPa"
    | "cyc/h"
    | "uSv/h"
    | "kW"
    | "kWh"
    | "V"
    | "A"
    | "L/min"
    | "";

export interface MetricData {
    value: (string | number)[];
    timestamp: number;
}

export interface MetricSpec {
    id: string;
    name: string;
    type: MetricType;
    unit: MetricUnit[];
}

export interface MetricHistory extends MetricSpec {
    measurements: MetricData[];
}
