import "./GroupDetail.css";

import { useParams } from "react-router";
import { Button, ButtonToolbar, Col, Container, Row } from "react-bootstrap";
import { arrayLast, statusToBootstrapColor } from "../../../utils";
import { useAppSelector, useHasDashboardWidgets } from "../../../store/store";
import { wrapMetricsInitialized } from "../../../utils/wrapMetricsInitialized";
import { MetricState } from "../../widgets/MetricState/MetricState";
import { WidgetLocation } from "../../widgets/WidgetLocation";
import { GroupStatus } from "../../widgets/GroupStatus/GroupStatus";
import { GroupStatusHistory } from "../../widgets/GroupStatusHistory/GroupStatusHistory";
import { useDispatch } from "react-redux";
import { addWidget, removeWidget } from "../../../store/dashboard/dashboard";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "../../../store/dashboard/DashboardWidget";
import { useMemo } from "react";

export const GroupDetail = wrapMetricsInitialized(() => {
    const { groupId } = useParams<Record<"groupId", string>>();

    const group = useAppSelector((state) => state.metrics[groupId!]);
    const groupStatus = arrayLast(group.statuses)?.value;

    const dispatch = useDispatch();

    const currentWidgets = useMemo(() => {
        const result: DashboardWidgetPath[] = [];
        if (group.statuses) {
            result.push({
                variant: DashboardWidgetVariant.GroupStatus,
                groupId: groupId!,
            });
        }
        for (const metricId in group.metrics) {
            result.push({
                variant: DashboardWidgetVariant.MetricState,
                groupId: groupId!,
                metricId: metricId,
            });
        }
        return result;
    }, [group.statuses, group.metrics, groupId]);
    const hasCurrentWidgets = useHasDashboardWidgets(currentWidgets);
    const hasAllCurrentWidgets = hasCurrentWidgets.every((v) => v);
    const hasAnyCurrentWidgets = !hasCurrentWidgets.every((v) => !v);

    const historyWidgets = useMemo(() => {
        const result: DashboardWidgetPath[] = [];
        if (group.statuses) {
            result.push({
                variant: DashboardWidgetVariant.GroupStatusHistory,
                groupId: groupId!,
            });
        }
        for (const metricId in group.metrics) {
            result.push({
                variant: DashboardWidgetVariant.MetricStateHistory,
                groupId: groupId!,
                metricId: metricId,
            });
        }
        return result;
    }, [group.statuses, group.metrics, groupId]);
    const hasHistoryWidgets = useHasDashboardWidgets(historyWidgets);
    const hasAllHistoryWidgets = hasHistoryWidgets.every((v) => v);
    const hasAnyHistoryWidgets = !hasHistoryWidgets.every((v) => !v);

    const addAllCurrent = () => {
        for (const widget of currentWidgets) {
            dispatch(addWidget(widget));
        }
    };

    const addAllHistory = () => {
        for (const widget of historyWidgets) {
            dispatch(addWidget(widget));
        }
    };

    const removeAllCurrent = () => {
        for (const widget of currentWidgets) {
            dispatch(removeWidget(widget));
        }
    };

    const removeAllHistory = () => {
        for (const widget of historyWidgets) {
            dispatch(removeWidget(widget));
        }
    };

    return (
        <div
            className={`group-detail ${
                groupStatus
                    ? `bg-${statusToBootstrapColor[groupStatus]}-subtle`
                    : ""
            }`}
        >
            <Container className="py-3">
                <Row className="g-3">
                    <Col
                        xs={12}
                        lg={6}
                        className="d-flex flex-column justify-content-center"
                    >
                        <h1 className="text-center my-3">
                            <b>{group.name}</b>
                        </h1>
                        <ButtonToolbar className="justify-content-center mb-4 gap-2">
                            <Button
                                variant="primary"
                                onClick={addAllCurrent}
                                disabled={hasAllCurrentWidgets}
                            >
                                <i className="fas fa-plus" />
                                <span className="ms-2">
                                    Add All Current to Dashboard
                                </span>
                            </Button>
                            <Button
                                variant="primary"
                                onClick={addAllHistory}
                                disabled={hasAllHistoryWidgets}
                            >
                                <i className="fas fa-plus" />
                                <span className="ms-2">
                                    Add All Histories to Dashboard
                                </span>
                            </Button>
                            <Button
                                variant="danger"
                                onClick={removeAllCurrent}
                                disabled={!hasAnyCurrentWidgets}
                            >
                                <i className="fas fa-minus" />
                                <span className="ms-2">
                                    Remove All Current from Dashboard
                                </span>
                            </Button>
                            <Button
                                variant="danger"
                                onClick={removeAllHistory}
                                disabled={!hasAnyHistoryWidgets}
                            >
                                <i className="fas fa-minus" />
                                <span className="ms-2">
                                    Remove All Histories from Dashboard
                                </span>
                            </Button>
                        </ButtonToolbar>
                    </Col>
                    {group.statuses ? (
                        <Col xs={12} lg={6}>
                            <GroupStatus
                                groupId={groupId!}
                                location={WidgetLocation.GroupDetail}
                            />
                        </Col>
                    ) : (
                        ""
                    )}
                    {...Object.values(group.metrics).map((metric) => (
                        <Col key={metric.id} xs={12} xl={6}>
                            <MetricState
                                metricId={metric.id}
                                groupId={groupId!}
                                location={WidgetLocation.GroupDetail}
                            />
                        </Col>
                    ))}
                    <Col xs={12} xl={6}>
                        {group.statuses ? (
                            <GroupStatusHistory
                                groupId={groupId!}
                                location={WidgetLocation.GroupDetail}
                            />
                        ) : (
                            ""
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
});
