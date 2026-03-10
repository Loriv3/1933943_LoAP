import type { MetricUnit } from "../../../../../store/metrics/MetricHistory";
import { clamp, formatValueUnitSplit, type CSSProperties } from "../../../../../utils";
import "./PressureGauge.css";

export function PressureGauge({
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
    const valueRatio = clamp((value - start) / (end - start), 0, 1);
    let startColor, startColorValue, endColor, endColorValue;
    for (let i = 1; i < colorSteps.length; i++) {
        if (colorSteps[i][1] >= valueRatio) {
            [startColor, startColorValue] = colorSteps[i - 1];
            [endColor, endColorValue] = colorSteps[i];
            break;
        }
    }

    const [valueFormatted, unitFormatted] = formatValueUnitSplit(value, unit);

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
                    {valueFormatted}
                </span>
                <br />
                <span className="speedometer-value-unit">{unitFormatted}</span>
            </div>
        </div>
    );
}


