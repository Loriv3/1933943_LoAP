import type { MetricSpec, MetricState } from "./MetricState";

export const enum Status {
    Ok = "ok",
    Warning = "warning",
}

export interface GroupStatusData {
    value: Status;
    timestamp: number;
}

export interface GroupSpec {
    id: string;
    subtitle: string | null;
    name: string;
    hasStatus: boolean;
    metrics: Record<string, MetricSpec>;
}

export interface GroupState {
    id: string;
    subtitle: string | null;
    name: string;
    statuses: GroupStatusData[] | null;
    metrics: Record<string, MetricState>;
}
