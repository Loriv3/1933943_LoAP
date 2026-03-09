import { createSlice } from "@reduxjs/toolkit";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "./DashboardWidget";

export const dashboardWidgetId = (path: DashboardWidgetPath) => {
    switch (path.variant) {
        case DashboardWidgetVariant.GroupStatus:
            return `${path.groupId}.status`;
        case DashboardWidgetVariant.GroupStatusHistory:
            return `${path.groupId}.status-history`;
        case DashboardWidgetVariant.MetricState:
            return `${path.groupId}.${path.metricId}.state`;
        case DashboardWidgetVariant.MetricStateHistory:
            return `${path.groupId}.${path.metricId}.state-history`;
        case DashboardWidgetVariant.ActuatorToggle:
            return `${path.actuatorId}.state`;
        case DashboardWidgetVariant.ActuatorHistory:
            return `${path.actuatorId}.state-history`;
    }
};

export const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
        orderById: {} as Record<string, number>,
        pathsByOrder: [] as DashboardWidgetPath[],
    },
    reducers: {
        addWidget: (
            state,
            {
                payload: path,
            }: {
                payload: DashboardWidgetPath;
            }
        ) => {
            const id = dashboardWidgetId(path);
            if (id in state.orderById) return;
            state.orderById[id] = state.pathsByOrder.length;
            state.pathsByOrder.push(path);
        },
        removeWidget: (
            state,
            {
                payload: path,
            }: {
                payload: DashboardWidgetPath;
            }
        ) => {
            const id = dashboardWidgetId(path);
            const order = state.orderById[id];
            if (typeof order === "undefined") return;
            delete state.orderById[id];
            state.pathsByOrder.splice(order, 1);
            for (let i = order; i < state.pathsByOrder.length; i++) {
                state.orderById[dashboardWidgetId(state.pathsByOrder[i])]--;
            }
        },
    },
});

export const { addWidget, removeWidget } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
