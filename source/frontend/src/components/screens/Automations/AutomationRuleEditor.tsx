import "./AutomationRule.css";

import {
    AutomationRuleOperator,
    operatorToString,
    type AutomationRule,
} from "./AutomationRule";
import React, { useState } from "react";
import { useAppSelector } from "../../../store/store";
import { Button, ButtonToolbar } from "react-bootstrap";
import { formatUnit } from "../../../utils";
import { MetricType, type MetricUnit } from "../../../store/metrics/MetricHistory";

export function AutomationRuleEditor({
    initRule,
    onConfirm,
    onDiscard,
}: {
    initRule?: AutomationRule | null;
    onConfirm: (rule: AutomationRule) => void;
    onDiscard: () => void;
}) {
    const metrics = useAppSelector((state) => state.metrics);
    const actuators = useAppSelector((state) => state.actuators);

    const [rule, setRule] = useState<Partial<AutomationRule>>(initRule ?? {});
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

    const parseStringOrNone = (v: string): string | undefined =>
        v ? v : undefined;
    const parseBoolOrNone = (v: string): boolean | undefined =>
        v ? !!+v : undefined;

    const hasAllFields =
        rule.groupId &&
        rule.metricId &&
        rule.operator &&
        typeof rule.compareValue !== "undefined" &&
        typeof rule.unit !== "undefined" &&
        rule.actuatorId &&
        typeof rule.actuatorState !== "undefined";

    const updateUnitCompareValue = (rule: Partial<AutomationRule>) => {
        if (rule.groupId && rule.metricId) {
            const units = metrics[rule.groupId].metrics[rule.metricId].unit;
            if (units.length === 1) {
                rule.unit = units[0];
            }
        } else {
            rule.unit = undefined;
            rule.compareValue = undefined;
        }
        return rule;
    };

    let unit: React.ReactNode;
    if (
        rule.groupId &&
        rule.metricId &&
        metrics[rule.groupId].metrics[rule.metricId].unit.length === 1
    ) {
        const unitValue = metrics[rule.groupId].metrics[rule.metricId].unit[0];
        unit = (
            <select className="automation-rule-unit" disabled>
                <option value={unitValue}>{formatUnit(unitValue)}</option>
            </select>
        );
    } else {
        unit = (
            <select
                className="automation-rule-unit"
                onChange={(e) => {
                    const unit = parseStringOrNone(e.target.value);
                    setRule({
                        ...rule,
                        unit: unit as MetricUnit | undefined,
                    });
                }}
                value={valueOrEmpty(rule.unit)}
                disabled={!(rule.groupId && rule.metricId)}
            >
                <option value="">...</option>
                {...rule.groupId && rule.metricId
                    ? metrics[rule.groupId].metrics[rule.metricId].unit.map(
                          (unit) => (
                              <option value={unit}>{formatUnit(unit)}</option>
                          )
                      )
                    : []}
            </select>
        );
    }

    let compareValue: React.ReactNode;
    if (rule.groupId && rule.metricId) {
        switch (metrics[rule.groupId].metrics[rule.metricId].type) {
            case MetricType.AirlockState: {
                compareValue = (
                    <select
                        className="automation-rule-value"
                        onChange={(e) =>
                            setRule({
                                ...rule,
                                compareValue: parseStringOrNone(e.target.value),
                            })
                        }
                        value={valueOrEmpty(rule.compareValue)}
                    >
                        <option value="">...</option>
                        <option value={"idle"}>Idle</option>
                        <option value={"pressurizing"}>Pressurizing</option>
                        <option value={"depressurizing"}>Depressurizing</option>
                    </select>
                );
                break;
            }
            default: {
                compareValue = (
                    <input
                        type="number"
                        className="automation-rule-value"
                        onChange={(e) =>
                            setRule({
                                ...rule,
                                compareValue:
                                    e.target.value === ""
                                        ? undefined
                                        : +e.target.value,
                            })
                        }
                        value={rule.compareValue ?? ""}
                    />
                );
            }
        }
    } else {
        compareValue = (
            <input
                type="number"
                className="automation-rule-value"
                value=""
                disabled
            />
        );
    }

    return (
        <>
            <div>
                <span className="automation-rule-keyword">IF </span>
                <select
                    className="automation-rule-name"
                    onChange={(e) => {
                        const groupId = parseStringOrNone(e.target.value);
                        setRule(
                            updateUnitCompareValue({
                                ...rule,
                                groupId,
                                metricId:
                                    groupId === rule.groupId
                                        ? rule.metricId
                                        : undefined,
                            })
                        );
                    }}
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
                    onChange={(e) =>
                        setRule(
                            updateUnitCompareValue({
                                ...rule,
                                metricId: parseStringOrNone(e.target.value),
                            })
                        )
                    }
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
                        setRule({
                            ...rule,
                            operator: parseStringOrNone(e.target.value) as
                                | AutomationRuleOperator
                                | undefined,
                        })
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
                {compareValue}
                <span className="automation-rule-keyword"> </span>
                {unit}
                <span className="automation-rule-keyword"> THEN set </span>
                <select
                    className="automation-rule-name"
                    onChange={(e) =>
                        setRule({
                            ...rule,
                            actuatorId: parseStringOrNone(e.target.value),
                        })
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
                            actuatorState: parseBoolOrNone(e.target.value),
                        });
                    }}
                    value={boolValueOrEmpty(rule.actuatorState)}
                >
                    <option value="">...</option>
                    <option value="0">OFF</option>
                    <option value="1">ON</option>
                </select>
            </div>
            <ButtonToolbar className="mt-3 justify-content-center gap-2">
                <Button
                    variant="primary"
                    disabled={!hasAllFields}
                    onClick={() => onConfirm(rule as AutomationRule)}
                >
                    <i className="fas fa-check" />
                    <span className="ms-2 me-1">Confirm</span>
                </Button>
                <Button variant="danger" onClick={onDiscard}>
                    <i className="fas fa-trash" />
                    <span className="ms-2 me-1">Discard</span>
                </Button>
            </ButtonToolbar>
        </>
    );
}
