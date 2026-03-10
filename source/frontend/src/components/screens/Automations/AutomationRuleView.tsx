import "./AutomationRule.css";

import { formatValueUnitSplit } from "../../../utils";
import { operatorToString, type SavedAutomationRule } from "./AutomationRule";
import { Button, ButtonToolbar } from "react-bootstrap";
import { useState } from "react";
import { AutomationRuleEditor } from "./AutomationRuleEditor";

export function AutomationRuleView({
    rule,
    onEdit,
    onDelete,
}: {
    rule: SavedAutomationRule;
    onEdit: (rule: SavedAutomationRule, cb: () => void) => void;
    onDelete: () => void;
}) {
    const [isEditing, setEditing] = useState(false);
    const [value, unit] = formatValueUnitSplit(rule.compareValue, rule.unit);
    return isEditing ? (
        <AutomationRuleEditor
            initRule={rule}
            onConfirm={(newRule) => {
                onEdit({ id: rule.id, ...newRule }, () => {
                    setEditing(false);
                });
            }}
            onDiscard={() => setEditing(false)}
        />
    ) : (
        <>
            <div>
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
            </div>
            <ButtonToolbar className="mt-3 justify-content-center gap-2">
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditing(true);
                    }}
                >
                    <i className="fas fa-pencil" />
                    <span className="ms-2 me-1">Edit</span>
                </Button>
                <Button variant="danger" onClick={onDelete}>
                    <i className="fas fa-trash" />
                    <span className="ms-2 me-1">Delete</span>
                </Button>
            </ButtonToolbar>
        </>
    );
}
