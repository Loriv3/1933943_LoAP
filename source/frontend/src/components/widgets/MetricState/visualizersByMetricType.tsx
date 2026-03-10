/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    type MetricUnit,
    MetricType,
} from "../../../store/metrics/MetricHistory";
import {
    PhStateVis,
    HumidityStateVis,
    WaterLevelStateVis,
    TemperatureStateVis,
    PressureStateVis,
    AQParticleVolumeConcentrationStateVis,
    AQVolumeVolumeConcentrationStateVis,
    AQMassVolumeConcentrationStateVis,
    OxygenStateVis,
    CyclesPerHourStateVis,
    RadiationStateVis,
    PowerStateVis,
    CumulativePowerStateVis,
    VoltageStateVis,
    CurrentStateVis,
    FlowStateVis,
    AirlockStateVis,
} from "./MetricStateVis";

export const visualizersByMetricType: {
    [key: string]: React.FC<{
        value: (string | number)[];
        unit: MetricUnit[];
    }>;
} = {
    [MetricType.Ph]: PhStateVis as any,
    [MetricType.AQParticleVolumeConcentration]: AQParticleVolumeConcentrationStateVis as any,
    [MetricType.AQVolumeVolumeConcentration]: AQVolumeVolumeConcentrationStateVis as any,
    [MetricType.AQMassVolumeConcentration]: AQMassVolumeConcentrationStateVis as any,
    [MetricType.WaterLevel]: WaterLevelStateVis as any,
    [MetricType.Temperature]: TemperatureStateVis as any,
    [MetricType.Humidity]: HumidityStateVis as any,
    [MetricType.Pressure]: PressureStateVis as any,
    [MetricType.Oxygen]: OxygenStateVis as any,
    [MetricType.CyclesPerHour]: CyclesPerHourStateVis as any,
    [MetricType.Radiation]: RadiationStateVis as any,
    [MetricType.Power]: PowerStateVis as any,
    [MetricType.CumulativePower]: CumulativePowerStateVis as any,
    [MetricType.Voltage]: VoltageStateVis as any,
    [MetricType.Current]: CurrentStateVis as any,
    [MetricType.Flow]: FlowStateVis as any,
    [MetricType.AirlockState]: AirlockStateVis as any,
};
