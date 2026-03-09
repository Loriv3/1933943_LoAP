import type { MetricUnit } from "../../../../store/metrics/MetricHistory";
import { formatUnit, type CSSProperties } from "../../../../utils";
import "./PhStateVis.css";

const phColors = [
    "#ee3722",
    "#ee3479",
    "#f47e26",
    "#fba822",
    "#f5ec08",
    "#a3cc38",
    "#4db847",
    "#009247",
    "#009495",
    "#5175ba",
    "#454a9f",
    "#2a2f84",
    "#94258b",
    "#7b2779",
];

function PhScale({ value, size }: { value: number; size: number }) {
    const fillParts = [];
    for (let i = 0; i < 14; i++) {
        fillParts.push(
            <div
                key={i}
                className="ph-scale-fill-part"
                style={
                    {
                        "--color": phColors[i],
                        "--value": i,
                    } as CSSProperties
                }
            />
        );
    }
    return (
        <div
            className="ph-scale"
            style={
                {
                    fontSize: `${size}em`,
                } as CSSProperties
            }
        >
            <div
                className="ph-scale-fill"
                style={
                    {
                        "--value": value,
                    } as CSSProperties
                }
            >
                {...fillParts}
            </div>
        </div>
    );
}

export function PhStateVis({
    value: [value],
    unit: [unit],
}: {
    value: [number];
    unit: [MetricUnit];
}) {
    const size = 4;
    return (
        <div className="d-flex justify-content-center align-items-center">
            <PhScale value={value} size={size} />
            <h1 className="m-0 ms-3">
                <b>{formatUnit(value, unit)}</b>
            </h1>
        </div>
    );
}
