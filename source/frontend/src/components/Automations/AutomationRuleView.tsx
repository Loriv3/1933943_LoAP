import "./AutomationRule.css";

import { formatValueUnitSplit } from "../../utils";
import { type AutomationRule, operatorToString } from "./AutomationRule";

export function AutomationRuleView({ rule }: { rule: AutomationRule }) {
    const [value, unit] = formatValueUnitSplit(rule.compareValue, rule.unit);
    return (
        <>
            <span className="automation-rule-keyword">IF </span>
            <span className="automation-rule-name">{rule.groupId}</span>
            <span className="automation-rule-keyword">.</span>
            <span className="automation-rule-name">{rule.metricId}</span>
            <span className="automation-rule-keyword">
                {" "}
                {operatorToString(rule.operator)}{" "}
            </span>
            <span className="automation-rule-value">{value}</span>
            <span className="automation-rule-unit"> {unit}</span>
            <br />
            <span className="automation-rule-keyword">THEN set </span>
            <span className="automation-rule-name">{rule.actuatorId}</span>
            <span className="automation-rule-keyword"> to </span>
            <span className="automation-rule-value">
                {rule.actuatorState ? "ON" : "OFF"}
            </span>
        </>
    );
}
