export const enum DashboardWidgetVariant {
    GroupStatus,
    GroupStatusHistory,
    MetricState,
    MetricStateHistory,
    ActuatorToggle,
    ActuatorHistory,
}

export interface DashboardGroupStatusWidgetPath {
    variant: DashboardWidgetVariant.GroupStatus;
    groupId: string;
}

export interface DashboardGroupStatusHistoryWidgetPath {
    variant: DashboardWidgetVariant.GroupStatusHistory;
    groupId: string;
}

export interface DashboardMetricStateWidgetPath {
    variant: DashboardWidgetVariant.MetricState;
    groupId: string;
    metricId: string;
}

export interface DashboardMetricStateHistoryWidgetPath {
    variant: DashboardWidgetVariant.MetricStateHistory;
    groupId: string;
    metricId: string;
}

export interface DashboardActuatorToggleWidgetPath {
    variant: DashboardWidgetVariant.ActuatorToggle;
    actuatorId: string;
}

export interface DashboardActuatorHistoryWidgetPath {
    variant: DashboardWidgetVariant.ActuatorHistory;
    actuatorId: string;
}

export type DashboardWidgetPath =
    | DashboardGroupStatusWidgetPath
    | DashboardGroupStatusHistoryWidgetPath
    | DashboardMetricStateWidgetPath
    | DashboardMetricStateHistoryWidgetPath
    | DashboardActuatorToggleWidgetPath
    | DashboardActuatorHistoryWidgetPath;
