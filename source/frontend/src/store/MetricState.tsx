export const enum MetricType {
    Ph = "ph",
    AQParticleVolumeConcentration = "air_quality.particle_volume_concentration",
    AQVolumeVolumeConcentration = "air_quality.volume_volume_concentration",
    AQMassVolumeConcentration = "air_quality.mass_volume_concentration",
    WaterLevel = "water_level",
    Temperature = "temperature",
    Humidity = "humidity",
    Pressure = "pressure",
    CyclesPerHour = "cycles_per_hour",
    Radiation = "radiation",
    Power = "power.power",
    CumulativePower = "power.cumulative_power",
    Voltage = "power.voltage",
    Current = "power.current",
    Flow = "flow",
}

export type MetricUnit =
    | "pH"
    | "ppm"
    | "ppb"
    | "%"
    | "g/m3"
    | "L"
    | "C"
    | "Pa"
    | "h^-1"
    | "Sv/h"
    | "W"
    | "Wh"
    | "V"
    | "A"
    | "L/min";

export interface MetricData {
    value: number[];
    timestamp: number;
}

export interface MetricSpec {
    id: string;
    name: string;
    type: MetricType;
    unit: MetricUnit[];
}

export interface MetricState extends MetricSpec {
    measurements: MetricData[];
}
