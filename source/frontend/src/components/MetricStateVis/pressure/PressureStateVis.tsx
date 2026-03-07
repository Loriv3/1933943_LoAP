import type { CSSProperties } from "../../../utils";
import "./PressureStateVis.css";

function Speedometer({
    start,
    end,
    value,
    size,
    trackColor = "#e0e0e0",
    colorSteps = [
        ["#4579e2", 0],
        ["#00c000", 0.5],
        ["#e0c000", 0.75],
        ["#e04040", 1],
    ],
    unit = null,
}: {
    start: number;
    end: number;
    value: number;
    size: number;
    trackColor?: string;
    colorSteps?: [string, number][];
    unit?: string | null;
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
            {unit ? (
                <div className="speedometer-value">
                    <span className="speedometer-value-value">{value}</span>
                    <br />
                    <span className="speedometer-value-unit">{unit}</span>
                </div>
            ) : (
                ""
            )}
        </div>
    );
}

export function PressureStateVis({
    value: [value],
}: {
    value: [number];
}) {
    const start = 97600;
    const end = 105000;
    const size = 12;
    return (
        <Speedometer
            start={start / 100}
            end={end / 100}
            value={Math.round(value) / 100}
            size={size}
            unit="hPa"
        />
    );
}
