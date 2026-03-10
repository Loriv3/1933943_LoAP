import type {
    AutomationRule,
    AutomationRuleOperator,
    SavedAutomationRule,
} from "../components/screens/Automations/AutomationRule";
import type { MetricUnit } from "../store/metrics/MetricHistory";

export interface ApiAutomationRule {
    group_id: string;
    metric_id: string;
    operator: AutomationRuleOperator;
    compare_value: number | string;
    unit: MetricUnit;
    actuator_id: string;
    actuator_state: boolean;
}

export interface ApiSavedAutomationRule extends ApiAutomationRule {
    id: string;
}

export const convertApiAutomationRuleToInternal = (
    data: ApiSavedAutomationRule
): SavedAutomationRule => {
    return {
        id: data.id,
        groupId: data.group_id,
        metricId: data.metric_id,
        operator: data.operator,
        compareValue: data.compare_value,
        unit: data.unit,
        actuatorId: data.actuator_id,
        actuatorState: data.actuator_state,
    };
};

export const convertInternalToApiAutomationRule = (
    data: AutomationRule
): ApiAutomationRule => {
    return {
        group_id: data.groupId,
        metric_id: data.metricId,
        operator: data.operator,
        compare_value: data.compareValue,
        unit: data.unit,
        actuator_id: data.actuatorId,
        actuator_state: data.actuatorState,
    };
};
