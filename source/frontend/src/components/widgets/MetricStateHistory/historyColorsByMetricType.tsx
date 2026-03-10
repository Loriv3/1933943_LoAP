import { MetricType } from "../../../store/metrics/MetricHistory";
import { binaryGradient, multiStopGradient } from "../../../utils";

const waterGradient = binaryGradient({
    startColor: "#4579e280",
    endColor: "#2d55aa80",
    start: 0,
    end: 100,
});
const humidityGradient = waterGradient;

const phGradient = multiStopGradient([
    ["#ee372280", 0],
    ["#ee372280", 1 - 0.5],
    ["#ee347980", 2 - 0.5],
    ["#f47e2680", 3 - 0.5],
    ["#fba82280", 4 - 0.5],
    ["#f5ec0880", 5 - 0.5],
    ["#a3cc3880", 6 - 0.5],
    ["#4db84780", 7 - 0.5],
    ["#00924780", 8 - 0.5],
    ["#00949580", 9 - 0.5],
    ["#5175ba80", 10 - 0.5],
    ["#454a9f80", 11 - 0.5],
    ["#2a2f8480", 12 - 0.5],
    ["#94258b80", 13 - 0.5],
    ["#7b277980", 14 - 0.5],
    ["#7b277980", 14],
]);

const pressureGradient = multiStopGradient([
    ["#61228680", 93.3 + (109.3 - 93.3) * 0],
    ["#4579e280", 93.3 + (109.3 - 93.3) * 0.25],
    ["#00c00080", 93.3 + (109.3 - 93.3) * 0.5],
    ["#e0c00080", 93.3 + (109.3 - 93.3) * 0.75],
    ["#e0404080", 93.3 + (109.3 - 93.3) * 1],
]);

const temperatureGradient = binaryGradient({
    startColor: "#8080ff80",
    endColor: "#ff808080",
    start: 0,
    end: 60,
});

const aqParticleVolumeConcentrationGradient = multiStopGradient([
    ["#4579e280", 1500 * 0],
    ["#00c00080", 1500 * 0.5],
    ["#e0c00080", 1500 * 0.75],
    ["#e0404080", 1500 * 1],
]);

const aqVolumeVolumeConcentrationGradient = multiStopGradient([
    ["#4579e280", 100 * 0],
    ["#00c00080", 100 * 0.5],
    ["#e0c00080", 100 * 0.75],
    ["#e0404080", 100 * 1],
]);

const aqMassVolumeConcentrationGradient = multiStopGradient([
    ["#4579e280", 50 * 0],
    ["#00c00080", 50 * 0.5],
    ["#e0c00080", 50 * 0.75],
    ["#e0404080", 50 * 1],
]);

const oxygenGradient = multiStopGradient([
    ["#ff4040c0", 0],
    ["#4579e280", 30],
]);

const cyclesGradient = multiStopGradient([
    ["#4579e280", 14 * 0],
    ["#00c00080", 14 * 0.5],
    ["#e0c00080", 14 * 0.75],
    ["#e0404080", 14 * 1],
]);

const radiationGradient = multiStopGradient([
    ["#4579e280", 1 * 0],
    ["#00c00080", 1 * 0.5],
    ["#e0c00080", 1 * 0.75],
    ["#e0404080", 1 * 1],
]);

const powerGradient = multiStopGradient([
    ["#4579e280", 300 * 0],
    ["#00c00080", 300 * 0.5],
    ["#e0c00080", 300 * 0.75],
    ["#e0404080", 300 * 1],
]);

const voltageGradient = multiStopGradient([
    ["#4579e280", 300 + (500 - 300) * 0],
    ["#00c00080", 300 + (500 - 300) * 0.5],
    ["#e0c00080", 300 + (500 - 300) * 0.75],
    ["#e0404080", 300 + (500 - 300) * 1],
]);

const currentGradient = multiStopGradient([
    ["#4579e280", 600 * 0],
    ["#00c00080", 600 * 0.5],
    ["#e0c00080", 600 * 0.75],
    ["#e0404080", 600 * 1],
]);

const flowGradient = multiStopGradient([
    ["#4579e280", 60 + (180 - 60) * 0],
    ["#00c00080", 60 + (180 - 60) * 0.5],
    ["#e0c00080", 60 + (180 - 60) * 0.75],
    ["#e0404080", 60 + (180 - 60) * 1],
]);

const airlockGradient = multiStopGradient([
    ["#4579e280", 0],
    ["#00c00080", 1],
    ["#e0c00080", 2],
]);

export const colorsByType = {
    [MetricType.Ph]: phGradient,
    [MetricType.AQParticleVolumeConcentration]: aqParticleVolumeConcentrationGradient,
    [MetricType.AQVolumeVolumeConcentration]: aqVolumeVolumeConcentrationGradient,
    [MetricType.AQMassVolumeConcentration]: aqMassVolumeConcentrationGradient,
    [MetricType.WaterLevel]: waterGradient,
    [MetricType.Temperature]: temperatureGradient,
    [MetricType.Humidity]: humidityGradient,
    [MetricType.Pressure]: pressureGradient,
    [MetricType.Oxygen]: oxygenGradient,
    [MetricType.CyclesPerHour]: cyclesGradient,
    [MetricType.Radiation]: radiationGradient,
    [MetricType.Power]: powerGradient,
    [MetricType.CumulativePower]: "#e0c00080",
    [MetricType.Voltage]: voltageGradient,
    [MetricType.Current]: currentGradient,
    [MetricType.Flow]: flowGradient,
    [MetricType.AirlockState]: airlockGradient,
};
