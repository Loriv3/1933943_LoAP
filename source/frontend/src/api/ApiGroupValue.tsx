import type { Status } from "../store/metrics/GroupHistory";
import type { AddGroupValueData } from "../store/metrics/metrics";
import type { MetricType, MetricUnit } from "../store/metrics/MetricHistory";

export interface ApiMetricValue {
    id: string;
    type: MetricType;
    value: { value: number | string; unit: MetricUnit }[];
    status: Status | null;
}

export interface ApiGroupValue {
    group_id: string;
    at: string;
    metrics: ApiMetricValue[];
    status: Status;
}

export const convertApiGroupDataToInternal = (
    data: ApiGroupValue
): AddGroupValueData => {
    const metricValues = {} as Record<string, (string | number)[]>;
    for (const metric of data.metrics) {
        metricValues[metric.id] = metric.value.map((value) => value.value);
    }
    return {
        groupId: data.group_id,
        date: new Date(data.at),
        metricValues,
        status: data.status,
    };
};
