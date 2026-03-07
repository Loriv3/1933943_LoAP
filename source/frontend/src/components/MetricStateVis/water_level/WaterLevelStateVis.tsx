import type { MetricUnit } from "../../../store/MetricState";
import { formatUnit, type CSSProperties } from "../../../utils";
import "./WaterLevelStateVis.css";

function WaterLevelScale({
    valuePercent,
    valueLiters = null,
    unitPercent,
    unitLiters,
    size,
}: {
    valuePercent: number;
    valueLiters?: number | null;
    unitPercent: MetricUnit,
    unitLiters: MetricUnit,
    size: number;
}) {
    return (
        <div
            className="water-level"
            style={{ fontSize: `${size}em`, "--value": valuePercent } as CSSProperties}
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
                        {formatUnit(valuePercent, unitPercent)}
                    </div>
                    <div className="water-level-value-liters">
                        {formatUnit(valuePercent, unitLiters)}
                    </div>
                </div>
            )}
        </div>
    );
}

export function WaterLevelStateVis({
    value: [valuePercent, valueLiters],
    unit: [unitPercent, unitLiters],
}: {
    value: [number, number];
    unit: [MetricUnit, MetricUnit]
}) {
    const size = 4;
    return (
        <div className="d-flex justify-content-center">
            <WaterLevelScale
                valuePercent={valuePercent}
                valueLiters={valueLiters}
                unitPercent={unitPercent}
                unitLiters={unitLiters}
                size={size}
            />
        </div>
    );
}
