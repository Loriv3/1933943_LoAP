import { clamp, type CSSProperties } from "../../../../../utils";
import "./PhScale.css";

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

export function PhScale({ value, size }: { value: number; size: number }) {
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
                        "--value": clamp(value, 0, 14),
                    } as CSSProperties
                }
            >
                {...fillParts}
            </div>
        </div>
    );
}
