import { Button, Card, Collapse, Nav } from "react-bootstrap";
import { arrayLast, formatUnit, useTimer } from "../../../utils";
import { useState } from "react";
import { visualizerTypes } from "./visualizerTypes";
import { metricTypeIcons } from "../../../metricTypeIcons";
import { NavLink } from "react-router";
import { useDispatch } from "react-redux";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "../../../store/dashboard/DashboardWidget";
import { addWidget, removeWidget } from "../../../store/dashboard/dashboard";
import { useAppSelector, useHasDashboardWidget } from "../../../store/store";
import { WidgetLocation } from "../WidgetLocation";

export function MetricState({
    metricId,
    groupId,
    location,
}: {
    metricId: string;
    groupId: string;
    location: WidgetLocation;
}) {
    const groupName = useAppSelector(
        (state) => state.metrics[groupId].name
    );
    const metric = useAppSelector(
        (state) => state.metrics[groupId].metrics[metricId]
    );

    const [isOpen, setOpen] = useState(true);
    const Visualizer = visualizerTypes[metric.type];
    const value = arrayLast(metric.measurements)?.value;

    const lastUpdate = metric.measurements.length
        ? new Date(
              metric.measurements[metric.measurements.length - 1].timestamp
          )
        : null;
    const secondsSinceLastUpdate = useTimer(lastUpdate);

    const dispatch = useDispatch();
    const dashboardWidget = {
        variant: DashboardWidgetVariant.MetricState,
        groupId: groupId,
        metricId: metric.id,
    } satisfies DashboardWidgetPath;
    const hasDashboardWidget = useHasDashboardWidget(dashboardWidget);
    return (
        <Card>
            <Card.Header className="pe-0">
                <Nav className="justify-content-evenly align-items-center me-2 ms-2">
                    {location === WidgetLocation.MetricDetail ? (
                        <>
                            <Nav.Item>
                                <h4 className="m-0">Current Value</h4>
                            </Nav.Item>
                            <Nav.Item className="flex-fill" />{" "}
                        </>
                    ) : (
                        <>
                            <Nav.Item>
                                <h4 className="m-0">
                                    <i
                                        className={`m-0 fas fa-${
                                            metricTypeIcons[metric.type]
                                        }`}
                                    />
                                </h4>
                            </Nav.Item>
                            <Nav.Item className="ms-3">
                                <h4 className="m-0">
                                    <b>{location === WidgetLocation.GroupDetail ? metric.name : `${groupName} ${metric.name}`}</b>
                                </h4>
                            </Nav.Item>
                            <Nav.Item className="flex-fill" />{" "}
                        </>
                    )}
                    {isOpen ? (
                        ""
                    ) : (
                        <Nav.Item className="">
                            <h2 className="m-0">
                                <b>
                                    {value
                                        ? value
                                              .map((v, i) =>
                                                  formatUnit(v, metric.unit[i])
                                              )
                                              .join(", ")
                                        : "No Value"}
                                </b>
                            </h2>
                        </Nav.Item>
                    )}
                    <Nav.Item className="flex-fill" />
                    <Nav.Item>
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
                    </Nav.Item>
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
                        {value ? (
                            <Visualizer value={value} unit={metric.unit} />
                        ) : (
                            <h1 className="text-center">
                                <b>No Value</b>
                            </h1>
                        )}
                        {location === WidgetLocation.MetricDetail ? (
                            <div className="text-center text-muted mt-3 mb-1">
                                <small>
                                    Last updated:{" "}
                                    {secondsSinceLastUpdate === null
                                        ? "never"
                                        : `${secondsSinceLastUpdate} s ago`}
                                </small>
                            </div>
                        ) : (
                            <></>
                        )}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
