import type { MetricUnit } from "../../../../store/metrics/MetricHistory";
import { formatValueUnit, type CSSProperties } from "../../../../utils";
import "./TemperatureStateVis.css";

function Thermometer({
    start,
    end,
    value,
    size,
    coldColor = "#60a0ff",
    hotColor = "#ff4060",
}: {
    start: number;
    end: number;
    value: number;
    size: number;
    coldColor?: string;
    hotColor?: string;
}) {
    const notches = [];
    const adjustedStart = Math.floor(start / 10) * 10;
    const adjustedEnd = Math.ceil(end / 10) * 10;
    const adjustedHeight = adjustedEnd - adjustedStart;
    for (let i = 0; i < adjustedHeight; i += 10) {
        notches.push(
            <div
                key={i}
                className="thermometer-notch"
                style={
                    {
                        "--value": i / adjustedHeight,
                        "--value-percent": `${(i / adjustedHeight) * 100}%`,
                    } as CSSProperties
                }
            ></div>
        );
    }
    return (
        <div
            className="thermometer"
            style={
                {
                    "--cold-color": coldColor,
                    "--hot-color": hotColor,
                    fontSize: `${size}em`,
                } as CSSProperties
            }
        >
            <div className="thermometer-bulb" />
            <div className="thermometer-tube" />
            <div className="thermometer-bulb-fill" />
            <div className="thermometer-tube-fill">
                <div
                    className="thermometer-tube-fill-inner"
                    style={
                        {
                            "--value": (value - adjustedStart) / adjustedHeight,
                        } as CSSProperties
                    }
                />
                {...notches}
            </div>
        </div>
    );
}

export function TemperatureStateVis({
    value: [value],
    unit: [unit],
}: {
    value: [number];
    unit: [MetricUnit];
}) {
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
