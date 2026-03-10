import {
    Button,
    ButtonToolbar,
    Card,
    Col,
    Container,
    Row,
} from "react-bootstrap";
import { AutomationRuleEditor } from "./AutomationRuleEditor";
import { AutomationRuleView } from "./AutomationRuleView";
import {
    type AutomationRule,
    type SavedAutomationRule,
} from "./AutomationRule";
import { useEffect, useState } from "react";
import { useTimer } from "../../utils";
import { AUTOMATIONS_API_URL } from "../../env";
import {
    convertApiAutomationRuleToInternal,
    convertInternalToApiAutomationRule,
    type ApiSavedAutomationRule,
} from "../../api/ApiAutomationRule";

export function Automations() {
    const [rules, setRules] = useState<SavedAutomationRule[]>([]);
    const [nextRuleDraftIdx, setNextRuleDraftIdx] = useState(0);
    const [ruleDrafts, setRuleDrafts] = useState<number[]>([]);

    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const secondsSinceLastUpdate = useTimer(lastUpdate);
    useEffect(() => {
        if (secondsSinceLastUpdate !== null && secondsSinceLastUpdate < 5)
            return;
        (async () => {
            const rulesData: ApiSavedAutomationRule[] = await (
                await fetch(`http://${AUTOMATIONS_API_URL}/api/rules`)
            ).json();
            setRules(rulesData.map(convertApiAutomationRuleToInternal));
            setLastUpdate(new Date());
        })();
    }, [secondsSinceLastUpdate]);

    const addDraft = () => {
        setRuleDrafts([...ruleDrafts, nextRuleDraftIdx]);
        setNextRuleDraftIdx(nextRuleDraftIdx + 1);
    };

    const removeDraft = (idx: number) => {
        const newRuleDrafts = [...ruleDrafts];
        newRuleDrafts.splice(ruleDrafts.indexOf(idx), 1);
        setRuleDrafts(newRuleDrafts);
    };

    const confirmDraft = (idx: number, rule: AutomationRule) => {
        (async () => {
            try {
                const ruleData: SavedAutomationRule =
                    convertApiAutomationRuleToInternal(
                        await (
                            await fetch(
                                `http://${AUTOMATIONS_API_URL}/api/rules`,
                                {
                                    method: "POST",
                                    body: JSON.stringify(
                                        convertInternalToApiAutomationRule(rule)
                                    ),
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                }
                            )
                        ).json()
                    );
                setRules([ruleData, ...rules]);
                removeDraft(idx);
            } catch (e) {
                console.error("Error creating automation rule", e);
            }
        })();
    };

    const discardDraft = removeDraft;

    const editRule = (rule: SavedAutomationRule, cb: () => void) => {
        (async () => {
            try {
                await (
                    await fetch(
                        `http://${AUTOMATIONS_API_URL}/api/rules/${rule.id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(
                                convertInternalToApiAutomationRule(rule)
                            ),
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    )
                ).json();
                const newRules = [...rules];
                newRules[
                    newRules.findIndex((oldRule) => oldRule.id === rule.id)
                ] = rule;
                setRules(newRules);
            } catch (e) {
                console.error("Error editing automation rule", e);
            }
            cb();
        })();
    };

    const deleteRule = (ruleId: string) => {
        (async () => {
            try {
                const response = await fetch(
                    `http://${AUTOMATIONS_API_URL}/api/rules/${ruleId}`,
                    {
                        method: "DELETE",
                    }
                );
                if (response.status === 204) {
                    const newRules = [...rules];
                    newRules.splice(
                        newRules.findIndex((oldRule) => oldRule.id === ruleId),
                        1
                    );
                    setRules(newRules);
                }
            } catch (e) {
                console.error("Error deleting automation rule", e);
            }
        })();
    };

    return (
        <Container className="py-3">
            <h1 className="text-center my-3">
                <b>Automation Rules</b>
            </h1>
            <ButtonToolbar className="justify-content-center mb-4 gap-2">
                <Button variant="primary" onClick={() => addDraft()}>
                    <i className="fas fa-plus" />
                    <span className="ms-2">Create Rule</span>
                </Button>
            </ButtonToolbar>
            <Row className="g-3">
                {ruleDrafts.map((idx) => (
                    <Col xs={12} xl={6} key={idx}>
                        <Card>
                            <Card.Body>
                                <AutomationRuleEditor
                                    onConfirm={(rule) =>
                                        confirmDraft(idx, rule)
                                    }
                                    onDiscard={() => discardDraft(idx)}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                {...rules.map((rule) => (
                    <Col xs={12} xl={6} key={rule.id}>
                        <Card>
                            <Card.Body>
                                <AutomationRuleView
                                    rule={rule}
                                    onEdit={(rule, cb) => editRule(rule, cb)}
                                    onDelete={() => deleteRule(rule.id)}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}
