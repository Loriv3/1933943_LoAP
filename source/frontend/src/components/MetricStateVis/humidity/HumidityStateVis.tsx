import type { MetricUnit } from "../../../store/MetricState";
import { formatUnit, type CSSProperties } from "../../../utils";
import "./HumidityStateVis.css";

function HumidityScale({ value, size }: { value: number; size: number }) {
    return (
        <div
            className="humidity-scale"
            style={
                {
                    fontSize: `${size}em`,
                } as CSSProperties
            }
        >
            <div
                className="humidity-scale-fill"
                style={
                    {
                        "--value": value,
                    } as CSSProperties
                }
            />
        </div>
    );
}

export function HumidityStateVis({
    value: [value],
    unit: [unit],
}: {
    value: [number];
    unit: [MetricUnit];
}) {
    const size = 4;
    return (
        <div className="d-flex justify-content-center align-items-center">
            <HumidityScale value={value} size={size} />
            <h1 className="m-0 ms-3">
                <b>{formatUnit(value, unit)}</b>
            </h1>
        </div>
    );
}
