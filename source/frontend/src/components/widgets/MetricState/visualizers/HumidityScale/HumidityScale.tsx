import { clamp, type CSSProperties } from "../../../../../utils";
import "./HumidityScale.css";

export function HumidityScale({
    start,
    end,
    value,
    size,
    startColor = "#4579e280",
    endColor = "#2d55aa",
}: {
    start: number;
    end: number;
    value: number;
    size: number;
    startColor?: string;
    endColor?: string;
}) {
    const valueScaled = clamp((value - start) / (end - start), 0, 1);
    return (
        <div
            className="humidity-scale"
            style={
                {
                    fontSize: `${size}em`,
                    "--start-color": startColor,
                    "--end-color": endColor,
                } as CSSProperties
            }
        >
            <div
                className="humidity-scale-fill"
                style={
                    {
                        "--value": valueScaled,
                    } as CSSProperties
                }
            />
        </div>
    );
}
