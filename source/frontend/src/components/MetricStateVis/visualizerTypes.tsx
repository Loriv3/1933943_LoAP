/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetricType, type MetricUnit } from "../../store/MetricState";
import { HumidityStateVis } from "./humidity/HumidityStateVis";
import { PhStateVis } from "./ph/PhStateVis";
import { PressureStateVis } from "./pressure/PressureStateVis";
import { TemperatureStateVis } from "./temperature/TemperatureStateVis";
import { WaterLevelStateVis } from "./water_level/WaterLevelStateVis";

export const visualizerTypes: {
    [key: string]: React.FC<{
        value: number[];
        unit: MetricUnit[];
    }>;
} = {
    [MetricType.Ph]: PhStateVis as any,
    [MetricType.AQParticleVolumeConcentration]: HumidityStateVis as any,
    [MetricType.AQVolumeVolumeConcentration]: HumidityStateVis as any,
    [MetricType.AQMassVolumeConcentration]: HumidityStateVis as any,
    [MetricType.WaterLevel]: WaterLevelStateVis as any,
    [MetricType.Temperature]: TemperatureStateVis as any,
    [MetricType.Humidity]: HumidityStateVis as any,
    [MetricType.Pressure]: PressureStateVis as any,
    [MetricType.CyclesPerHour]: HumidityStateVis as any,
    [MetricType.Radiation]: HumidityStateVis as any,
    [MetricType.Power]: HumidityStateVis as any,
    [MetricType.CumulativePower]: HumidityStateVis as any,
    [MetricType.Voltage]: HumidityStateVis as any,
    [MetricType.Current]: HumidityStateVis as any,
    [MetricType.Flow]: HumidityStateVis as any,
};
