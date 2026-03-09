import { createSlice } from "@reduxjs/toolkit";
import type { GroupSpec, GroupHistory, Status } from "./GroupHistory";
import { dropTimeSeriesData } from "../../utils";
import type { MetricHistory } from "./MetricHistory";

export const MAX_HISTORY_SIZE = 100;

export interface AddGroupValueData {
    groupId: string;
    date: Date;
    status: Status | null;
    metricValues: Record<string, (string | number)[]>;
}

export const metricsSlice = createSlice({
    name: "metrics",
    initialState: {} as Record<string, GroupHistory>,
    reducers: {
        addGroupValue: (
            state,
            {
                payload: { groupId, date, status, metricValues },
            }: {
                payload: AddGroupValueData;
            }
        ) => {
            if (!(groupId in state)) return;
            const group = state[groupId];
            if (status !== null && group.statuses) {
                group.statuses.push({
                    value: status,
                    timestamp: date.getTime(),
                });
                dropTimeSeriesData(group.statuses, MAX_HISTORY_SIZE);
            }
            for (const metricId in metricValues) {
                if (!(metricId in group.metrics)) continue;
                const metric = group.metrics[metricId];
                metric.measurements.push({
                    value: metricValues[metricId],
                    timestamp: date.getTime(),
                });
                dropTimeSeriesData(metric.measurements, MAX_HISTORY_SIZE);
            }
        },
        addGroup: (
            state,
            {
                payload: groupSpec,
            }: {
                payload: GroupSpec;
            }
        ) => {
            const metrics: Record<string, MetricHistory> = {};
            for (const metricId in groupSpec.metrics) {
                metrics[metricId] = {
                    ...groupSpec.metrics[metricId],
                    measurements: [],
                };
            }
            state[groupSpec.id] = {
                id: groupSpec.id,
                subtitle: groupSpec.subtitle,
                name: groupSpec.name,
                statuses: groupSpec.hasStatus ? [] : null,
                metrics,
            };
        },
    },
});

export const { addGroupValue, addGroup } = metricsSlice.actions;
export const metricsReducer = metricsSlice.reducer;
