import "./Thermometer.css";

import { clamp, type CSSProperties } from "../../../../../utils";

export function Thermometer({
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
                            "--value": clamp(
                                (value - adjustedStart) / adjustedHeight,
                                0,
                                1
                            ),
                        } as CSSProperties
                    }
                />
                {...notches}
            </div>
        </div>
    );
}
