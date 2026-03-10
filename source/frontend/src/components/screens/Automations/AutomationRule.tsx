import type { MetricUnit } from "../../../store/metrics/MetricHistory";

export const enum AutomationRuleOperator {
    Lt = "lt",
    Le = "le",
    Eq = "eq",
    Ge = "ge",
    Gt = "gt",
}

export interface AutomationRule {
    groupId: string;
    metricId: string;
    operator: AutomationRuleOperator;
    compareValue: string | number;
    unit: MetricUnit;
    actuatorId: string;
    actuatorState: boolean;
}

export interface SavedAutomationRule extends AutomationRule {
    id: string;
}

const operatorStrings = {
    [AutomationRuleOperator.Lt]: <>&lt;</>,
    [AutomationRuleOperator.Le]: <>&le;</>,
    [AutomationRuleOperator.Eq]: "=",
    [AutomationRuleOperator.Ge]: <>&ge;</>,
    [AutomationRuleOperator.Gt]: <>&gt;</>,
};

export function operatorToString(operator: AutomationRuleOperator) {
    return operatorStrings[operator];
}
