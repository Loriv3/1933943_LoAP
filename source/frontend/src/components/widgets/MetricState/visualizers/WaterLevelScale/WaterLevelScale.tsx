import type { MetricUnit } from "../../../../../store/metrics/MetricHistory";
import {
    clamp,
    formatValueUnit,
    type CSSProperties,
} from "../../../../../utils";
import "./WaterLevelScale.css";

export function WaterLevelScale({
    valuePercent,
    valueLiters = null,
    unitPercent,
    unitLiters,
    size,
}: {
    valuePercent: number;
    valueLiters?: number | null;
    unitPercent: MetricUnit;
    unitLiters: MetricUnit;
    size: number;
}) {
    return (
        <div
            className="water-level"
            style={
                {
                    fontSize: `${size}em`,
                    "--value": clamp(valuePercent / 100, 0, 1),
                } as CSSProperties
            }
        >
            <div className="water-level-fill">
                <svg viewBox="0 0 1 5" preserveAspectRatio="none">
                    <defs>
                        <path
                            id="wave"
                            d="M 0 4
                            v -4
                            q .25 .125 0.5 0
                            t 0.5 0 0.5 0 0.5 0 0.5 0 0.5 0
                            v 4
                            z"
                        />
                        <linearGradient
                            id="front"
                            gradientTransform="rotate(90)"
                        >
                            <stop offset="0%" stopColor="#4579e2f8" />
                            <stop offset="30%" stopColor="#2d55aaf8" />
                        </linearGradient>
                    </defs>
                    <g>
                        {...[0, 1, 2].map((i) => (
                            <use
                                href="#wave"
                                y={1.94 + [0, 0.02, 0.06][i]}
                                key={i}
                                className={`water-level-wave-${i}`}
                            />
                        ))}
                    </g>
                </svg>
            </div>
            {valueLiters === null ? (
                ""
            ) : (
                <div className="water-level-value">
                    <div className="water-level-value-percent">
                        {formatValueUnit(valuePercent, unitPercent)}
                    </div>
                    <div className="water-level-value-liters">
                        {formatValueUnit(valueLiters, unitLiters)}
                    </div>
                </div>
            )}
        </div>
    );
}
