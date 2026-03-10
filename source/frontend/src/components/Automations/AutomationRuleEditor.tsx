import "./AutomationRule.css";

import {
    AutomationRuleOperator,
    operatorToString,
    type AutomationRule,
} from "./AutomationRule";
import { useState } from "react";
import { useAppSelector } from "../../store/store";

export function AutomationRuleEditor() {
    const metrics = useAppSelector((state) => state.metrics);
    const actuators = useAppSelector((state) => state.actuators);

    const [rule, setRule] = useState<Partial<AutomationRule>>({ compareValue: 0 });
    const operators = [
        AutomationRuleOperator.Lt,
        AutomationRuleOperator.Le,
        AutomationRuleOperator.Eq,
        AutomationRuleOperator.Ge,
        AutomationRuleOperator.Gt,
    ];

    const valueOrEmpty = <T,>(v: T | undefined): string =>
        typeof v === "undefined" ? "" : "" + v;
    const boolValueOrEmpty = (v: boolean | undefined): string =>
        typeof v === "undefined" ? "" : "" + +v;

    return (
        <>
            <span className="automation-rule-keyword">IF </span>
            <select
                className="automation-rule-name"
                onChange={(e) => setRule({ ...rule, groupId: e.target.value })}
                value={valueOrEmpty(rule.groupId)}
            >
                <option value="">...</option>
                {...Object.keys(metrics).map((groupId) => (
                    <option>{groupId}</option>
                ))}
            </select>
            <span className="automation-rule-keyword">.</span>
            <select
                className="automation-rule-name"
                onChange={(e) => setRule({ ...rule, metricId: e.target.value })}
                value={valueOrEmpty(rule.metricId)}
            >
                <option value="">...</option>
                {...rule.groupId
                    ? Object.keys(metrics[rule.groupId].metrics).map(
                          (metricId) => <option>{metricId}</option>
                      )
                    : []}
            </select>
            <span className="automation-rule-keyword"> </span>
            <select
                className="automation-rule-keyword"
                onChange={(e) =>
                    setRule({ ...rule, operator: e.target.value as AutomationRuleOperator })
                }
                value={valueOrEmpty(rule.operator)}
            >
                <option value="">...</option>
                {...operators.map((operator) => (
                    <option value={operator}>
                        {operatorToString(operator)}
                    </option>
                ))}
            </select>
            <span className="automation-rule-keyword"> </span>
            <input
                type="number"
                className="automation-rule-value"
                onChange={(e) => setRule({ ...rule, compareValue: +e.target.value })}
                value={valueOrEmpty(rule.compareValue)}
            />
            <span className="automation-rule-unit"> </span>
            <span className="automation-rule-unit">
                {rule.groupId && rule.metricId
                    ? metrics[rule.groupId].metrics[rule.metricId]?.unit
                    : "..."}
            </span>
            <span className="automation-rule-keyword"> THEN set </span>
            <select
                className="automation-rule-name"
                onChange={(e) =>
                    setRule({ ...rule, actuatorId: e.target.value })
                }
                value={valueOrEmpty(rule.actuatorId)}
            >
                <option value="">...</option>
                {...Object.keys(actuators).map((actuatorId) => (
                    <option>{actuatorId}</option>
                ))}
            </select>
            <span className="automation-rule-keyword"> to </span>
            <select
                className="automation-rule-value"
                onChange={(e) => {
                    setRule({
                        ...rule,
                        actuatorState: e.target.value
                            ? !!+e.target.value
                            : undefined,
                    });
                }}
                value={boolValueOrEmpty(rule.actuatorState)}
            >
                <option value="">...</option>
                <option value="0">OFF</option>
                <option value="1">ON</option>
            </select>
        </>
    );
}
