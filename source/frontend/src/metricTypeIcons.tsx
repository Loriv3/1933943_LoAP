import { MetricType } from "./store/metrics/MetricHistory";

export const metricTypeIcons: { [type: string]: string } = {
    [MetricType.Ph]: "flask",
    [MetricType.AQParticleVolumeConcentration]: "smog",
    [MetricType.AQVolumeVolumeConcentration]: "smog",
    [MetricType.AQMassVolumeConcentration]: "smog",
    [MetricType.WaterLevel]: "water",
    [MetricType.Temperature]: "temperature-half",
    [MetricType.Humidity]: "droplet",
    [MetricType.Pressure]: "arrow-down",
    [MetricType.Oxygen]: "mask-ventilator",
    [MetricType.CyclesPerHour]: "arrows-spin",
    [MetricType.Radiation]: "radiation",
    [MetricType.Power]: "bolt",
    [MetricType.CumulativePower]: "bolt",
    [MetricType.Voltage]: "bolt",
    [MetricType.Current]: "bolt",
    [MetricType.Flow]: "water",
    [MetricType.AirlockState]: "door-open"
}
