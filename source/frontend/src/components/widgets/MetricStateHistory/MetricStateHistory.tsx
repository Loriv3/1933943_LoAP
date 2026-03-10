import { Button, Card, Collapse, Nav } from "react-bootstrap";
import { useState } from "react";
import { useAppSelector, useHasDashboardWidget } from "../../../store/store";
import { MetricHistoryVis } from "./MetricHistoryVis";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "../../../store/dashboard/DashboardWidget";
import { useDispatch } from "react-redux";
import { addWidget, removeWidget } from "../../../store/dashboard/dashboard";
import { WidgetLocation } from "../WidgetLocation";
import { NavLink } from "react-router";

export function MetricStateHistory({
    metricId,
    groupId,
    location,
}: {
    metricId: string;
    groupId: string;
    location: WidgetLocation;
}) {
    const groupName = useAppSelector((state) => state.metrics[groupId].name);
    const metric = useAppSelector(
        (state) => state.metrics[groupId].metrics[metricId]
    );

    const [isOpen, setOpen] = useState(true);

    const dispatch = useDispatch();
    const dashboardWidget = {
        variant: DashboardWidgetVariant.MetricStateHistory,
        groupId: groupId,
        metricId: metric.id,
    } satisfies DashboardWidgetPath;
    const hasDashboardWidget = useHasDashboardWidget(dashboardWidget);

    return (
        <Card>
            <Card.Header className="pe-0">
                <Nav className="align-items-center me-2 ms-2">
                    <Nav.Item className="me-auto">
                        <h4 className="m-0">
                            {location === WidgetLocation.MetricDetail
                                ? ""
                                : location === WidgetLocation.GroupDetail
                                ? metric.name
                                : `${groupName} ${metric.name}`}{" "}
                            History
                        </h4>
                    </Nav.Item>
                    <Button
                        variant={hasDashboardWidget ? "danger" : "primary"}
                        title={
                            hasDashboardWidget
                                ? "Remove from Dashboard"
                                : "Add to Dashboard"
                        }
                        onClick={() => {
                            dispatch(
                                hasDashboardWidget
                                    ? removeWidget(dashboardWidget)
                                    : addWidget(dashboardWidget)
                            );
                        }}
                    >
                        {hasDashboardWidget ? (
                            <i className="fas fa-minus" />
                        ) : (
                            <i className="fas fa-plus" />
                        )}
                    </Button>
                    {location === WidgetLocation.MetricDetail ? (
                        <></>
                    ) : (
                        <>
                            <Nav.Item className="ms-2">
                                <NavLink to={`/metrics/${groupId}/${metric.id}`}>
                                    <Button
                                        variant="secondary"
                                        title="Show Detail"
                                    >
                                        <i className="fas fa-chevron-right" />
                                    </Button>
                                </NavLink>
                            </Nav.Item>
                        </>
                    )}
                    <Nav.Item className="ms-2 me-1">
                        <Button
                            variant="outline-secondary"
                            title={isOpen ? "Collapse" : "Show"}
                            data-bs-toggle="collapse"
                            data-bs-target={`#card-body-${metric.id}`}
                            onClick={() => setOpen(!isOpen)}
                        >
                            <i
                                className={`fas fa-chevron-${
                                    isOpen ? "up" : "down"
                                }`}
                            />
                        </Button>
                    </Nav.Item>
                </Nav>
            </Card.Header>
            <Collapse in={isOpen}>
                <div>
                    <Card.Body>
                        <MetricHistoryVis
                            data={metric.measurements}
                            type={metric.type}
                            unit={metric.unit}
                        />
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
