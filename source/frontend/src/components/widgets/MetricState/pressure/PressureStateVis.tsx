import type { MetricUnit } from "../../../../store/metrics/MetricHistory";
import { formatUnit, type CSSProperties } from "../../../../utils";
import "./PressureStateVis.css";

function Speedometer({
    start,
    end,
    value,
    size,
    trackColor = "#e0e0e0",
    colorSteps = [
        ["#612286", 0],
        ["#4579e2", 0.25],
        ["#00c000", 0.5],
        ["#e0c000", 0.75],
        ["#e04040", 1],
    ],
    unit,
}: {
    start: number;
    end: number;
    value: number;
    size: number;
    trackColor?: string;
    colorSteps?: [string, number][];
    unit: MetricUnit;
}) {
    const valueRatio = (value - start) / (end - start);
    let startColor, startColorValue, endColor, endColorValue;
    for (let i = 1; i < colorSteps.length; i++) {
        if (colorSteps[i][1] >= valueRatio) {
            [startColor, startColorValue] = colorSteps[i - 1];
            [endColor, endColorValue] = colorSteps[i];
            break;
        }
    }

    const valueFormatted = formatUnit(value, unit).split(" ", 2);

    return (
        <div
            className="speedometer"
            style={
                {
                    fontSize: `${size}em`,
                    "--track-color": trackColor,
                    "--color": `color-mix(in srgb, ${startColor}, ${endColor} ${
                        ((valueRatio - startColorValue!) /
                            (endColorValue! - startColorValue!)) *
                        100
                    }%)`,
                    "--value": valueRatio,
                } as CSSProperties
            }
        >
            <div className="speedometer-groove" />
            <div className="speedometer-score-container">
                <div className="speedometer-score" />
            </div>
            <div className="speedometer-notch" />
            <div className="speedometer-value">
                <span className="speedometer-value-value">
                    {valueFormatted[0]}
                </span>
                <br />
                <span className="speedometer-value-unit">
                    {valueFormatted[1]}
                </span>
            </div>
        </div>
    );
}

export function PressureStateVis({
    value: [value],
    unit: [unit],
}: {
    value: [number];
    unit: [MetricUnit];
}) {
    const start = 93.3;
    const end = 109.3;
    const size = 12;
    return (
        <div className="d-flex justify-content-center">
            <Speedometer
                start={start}
                end={end}
                value={value}
                size={size}
                unit={unit}
            />
        </div>
    );
}
