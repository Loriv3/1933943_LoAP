import { type MetricUnit } from "../../../store/metrics/MetricHistory";
import { formatValueUnit } from "../../../utils";
import { HumidityScale } from "./visualizers/HumidityScale/HumidityScale";
import { Thermometer } from "./visualizers/Thermometer/Thermometer";
import { WaterLevelScale } from "./visualizers/WaterLevelScale/WaterLevelScale";
import { PressureGauge } from "./visualizers/PressureGauge/PressureGauge";
import { PhScale } from "./visualizers/PhScale/PhScale";
import { Text } from "./visualizers/Text/Text";

type VisualizerPropsOneValue<T = number> = {
    value: [T];
    unit: [MetricUnit];
};

type VisualizerPropsTwoValues = {
    value: [number, number];
    unit: [MetricUnit, MetricUnit];
};

export function HumidityStateVis({
    value: [value],
    unit: [unit],
}: VisualizerPropsOneValue) {
    const size = 4;
    return (
        <div className="d-flex justify-content-center align-items-center">
            <HumidityScale start={0} end={100} value={value} size={size} />
            <h1 className="m-0 ms-3">
                <b>{formatValueUnit(value, unit)}</b>
            </h1>
        </div>
    );
}

export function PhStateVis({
    value: [value],
    unit: [unit],
}: VisualizerPropsOneValue) {
    const size = 4;
    return (
        <div className="d-flex justify-content-center align-items-center">
            <PhScale value={value} size={size} />
            <h1 className="m-0 ms-3">
                <b>{formatValueUnit(value, unit)}</b>
            </h1>
        </div>
    );
}

export function PressureStateVis({
    value: [value],
    unit: [unit],
}: VisualizerPropsOneValue) {
    const start = 93.3;
    const end = 109.3;
    const size = 20;
    return (
        <div className="d-flex justify-content-center pt-2 pb-3">
            <PressureGauge
                start={start}
                end={end}
                value={value}
                size={size}
                unit={unit}
            />
        </div>
    );
}

export function TemperatureStateVis({
    value: [value],
    unit: [unit],
}: VisualizerPropsOneValue) {
    const start = 0;
    const end = 60;
    const size = 4;
    return (
        <div className="d-flex justify-content-center align-items-center">
            <Thermometer start={start} end={end} value={value} size={size} />
            <h1 className="m-0 ms-3">
                <b>{formatValueUnit(value, unit)}</b>
            </h1>
        </div>
    );
}

export function WaterLevelStateVis({
    value: [valuePercent, valueLiters],
    unit: [unitPercent, unitLiters],
}: VisualizerPropsTwoValues) {
    const size = 4;
    return (
        <div className="d-flex justify-content-center">
            <WaterLevelScale
                valuePercent={unitPercent === "%" ? valuePercent : valueLiters}
                valueLiters={unitPercent === "%" ? valueLiters : valuePercent}
                unitPercent={unitPercent === "%" ? unitPercent : unitLiters}
                unitLiters={unitPercent === "%" ? unitLiters : unitPercent}
                size={size}
            />
        </div>
    );
}

function GenericGaugeStateVis({
    value: [value],
    unit: [unit],
    start,
    end,
    colorSteps = [
        ["#612286", 0],
        ["#4579e2", 0.25],
        ["#00c000", 0.5],
        ["#e0c000", 0.75],
        ["#e04040", 1],
    ],
}: VisualizerPropsOneValue & {
    start: number;
    end: number;
    colorSteps?: [string, number][];
}) {
    return (
        <div className="d-flex justify-content-center pt-2 pb-3">
            <PressureGauge
                start={start}
                end={end}
                value={value}
                unit={unit}
                size={20}
                colorSteps={colorSteps}
            />
        </div>
    );
}

function GenericScaleStateVis({
    value: [value],
    unit: [unit],
    start,
    end,
    startColor = "#4579e280",
    endColor = "#2d55aa",
}: VisualizerPropsOneValue & {
    start: number;
    end: number;
    startColor?: string;
    endColor?: string;
}) {
    return (
        <div className="d-flex justify-content-center align-items-center">
            <HumidityScale
                start={start}
                end={end}
                value={value}
                size={4}
                startColor={startColor}
                endColor={endColor}
            />
            <h1 className="m-0 ms-3">
                <b>{formatValueUnit(value, unit)}</b>
            </h1>
        </div>
    );
}

function GenericTextStateVis({
    value: [value],
    unit: [unit],
}: VisualizerPropsOneValue<number | string>) {
    return (
        <div className="d-flex justify-content-center align-items-center py-3">
            <Text value={value} unit={unit} size={2}></Text>
        </div>
    );
}

export function AQParticleVolumeConcentrationStateVis({
    value,
    unit,
}: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis
            value={value}
            unit={unit}
            start={0}
            end={1500}
            colorSteps={[
                ["#4579e2", 0],
                ["#00c000", 0.5],
                ["#e0c000", 0.75],
                ["#e04040", 1],
            ]}
        />
    );
}

export function AQVolumeVolumeConcentrationStateVis({
    value,
    unit,
}: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis
            value={value}
            unit={unit}
            start={0}
            end={100}
            colorSteps={[
                ["#4579e2", 0],
                ["#00c000", 0.5],
                ["#e0c000", 0.75],
                ["#e04040", 1],
            ]}
        />
    );
}

export function AQMassVolumeConcentrationStateVis({
    value,
    unit,
}: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis
            value={value}
            unit={unit}
            start={0}
            end={50}
            colorSteps={[
                ["#4579e2", 0],
                ["#00c000", 0.5],
                ["#e0c000", 0.75],
                ["#e04040", 1],
            ]}
        />
    );
}

export function OxygenStateVis({ value, unit }: VisualizerPropsOneValue) {
    return (
        <GenericScaleStateVis
            value={[value[0]]}
            unit={unit}
            start={0}
            end={30}
            startColor="#ff4040c0"
            endColor="#4579e280"
        />
    );
}

export function CyclesPerHourStateVis({
    value,
    unit,
}: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis value={value} unit={unit} start={0} end={14} />
    );
}

export function RadiationStateVis({ value, unit }: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis
            value={value}
            unit={unit}
            start={0}
            end={1}
            colorSteps={[
                ["#4579e2", 0],
                ["#00c000", 0.5],
                ["#e0c000", 0.75],
                ["#e04040", 1],
            ]}
        />
    );
}

export function PowerStateVis({ value, unit }: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis value={value} unit={unit} start={0} end={200} />
    );
}

export function CumulativePowerStateVis({
    value,
    unit,
}: VisualizerPropsOneValue) {
    return <GenericTextStateVis value={value} unit={unit} />;
}

export function VoltageStateVis({ value, unit }: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis value={value} unit={unit} start={300} end={500} />
    );
}

export function CurrentStateVis({ value, unit }: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis value={value} unit={unit} start={100} end={500} />
    );
}

export function FlowStateVis({ value, unit }: VisualizerPropsOneValue) {
    return (
        <GenericGaugeStateVis value={value} unit={unit} start={60} end={180} />
    );
}

export function AirlockStateVis({
    value,
    unit,
}: VisualizerPropsOneValue<string>) {
    return <GenericTextStateVis value={value} unit={unit} />;
}
