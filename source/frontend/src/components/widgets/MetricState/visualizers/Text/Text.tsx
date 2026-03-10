import type { MetricUnit } from "../../../../../store/metrics/MetricHistory";
import { formatValueUnitSplit } from "../../../../../utils";
import "./Text.css";

export function Text({
    value,
    size,
    unit,
}: {
    value: number | string;
    size: number;
    unit: MetricUnit;
}) {
    const [valueFormatted, unitFormatted] = formatValueUnitSplit(value, unit);

    return (
        <div
            className="text-metric-value"
            style={{
                fontSize: `${size}em`,
            }}
        >
            <span className="text-metric-value-value">{valueFormatted}</span>
            <br />
            <span className="text-metric-value-unit">{unitFormatted}</span>
        </div>
    );
}
