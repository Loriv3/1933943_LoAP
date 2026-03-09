import type { GroupSpec } from "../store/metrics/GroupHistory";
import type {
    MetricSpec,
    MetricType,
    MetricUnit,
} from "../store/metrics/MetricHistory";

export interface ApiMetricSpec {
    metric_id: string;
    name: string;
    type: MetricType;
    unit: MetricUnit[];
}

export interface ApiGroupSpec {
    group_id: string;
    subtitle?: string | null;
    name: string;
    has_status: boolean;
    metrics: ApiMetricSpec[];
}

export const convertApiGroupSpecToInternal = (
    data: ApiGroupSpec
): GroupSpec => {
    const metrics = {} as Record<string, MetricSpec>;
    for (const metric of data.metrics) {
        metrics[metric.metric_id] = {
            id: metric.metric_id,
            name: metric.name,
            type: metric.type,
            unit: metric.unit,
        };
    }
    return {
        id: data.group_id,
        subtitle: data.subtitle ?? null,
        name: data.name,
        hasStatus: data.has_status,
        metrics,
    };
};
