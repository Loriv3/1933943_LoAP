import "./GroupStatus.css";

import { useState } from "react";
import { Status } from "../../../store/metrics/GroupHistory";
import {
    arrayLast,
    formatTime,
    statusToBootstrapColor,
    useTimer,
} from "../../../utils";
import { useDispatch } from "react-redux";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "../../../store/dashboard/DashboardWidget";
import { useAppSelector, useHasDashboardWidget } from "../../../store/store";
import { Button, Card, Collapse, Nav } from "react-bootstrap";
import { addWidget, removeWidget } from "../../../store/dashboard/dashboard";
import { WidgetLocation } from "../WidgetLocation";
import { NavLink } from "react-router";

const statusToIcon = {
    [Status.Ok]: "check-circle",
    [Status.Warning]: "warning",
};

export function GroupStatus({
    groupId,
    location,
}: {
    groupId: string;
    location: WidgetLocation;
}) {
    const group = useAppSelector((state) => state.metrics[groupId]);

    const [isOpen, setOpen] = useState(true);
    const statusObj = arrayLast(group.statuses);
    const value = statusObj?.value;
    const statusColor = value ? statusToBootstrapColor[value] : "secondary";
    const statusIcon = value ? statusToIcon[value] : "question";

    const lastUpdate = statusObj ? new Date(statusObj.timestamp) : null;
    const secondsSinceLastUpdate = useTimer(lastUpdate);

    const dispatch = useDispatch();
    const dashboardWidget = {
        variant: DashboardWidgetVariant.GroupStatus,
        groupId: group.id,
    } satisfies DashboardWidgetPath;
    const hasDashboardWidget = useHasDashboardWidget(dashboardWidget);
    return (
        <Card
            className={`${
                value
                    ? `border-${statusColor} text-${statusColor}-emphasis`
                    : ""
            }`}
        >
            <Card.Header className="pe-0">
                <Nav className="justify-content-evenly align-items-center me-2 ms-2">
                    <Nav.Item>
                        <h4 className="m-0">
                            {location == WidgetLocation.GroupDetail
                                ? "Status"
                                : group.name}
                        </h4>
                    </Nav.Item>
                    <Nav.Item className="flex-fill" />
                    {isOpen ? (
                        ""
                    ) : (
                        <Nav.Item className="">
                            <h2
                                className={`m-0 text-uppercase text-${statusColor}`}
                            >
                                <i className={`fas fa-${statusIcon} me-1`} />
                                <b>{value ?? "Unknown"}</b>
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
                    {location === WidgetLocation.GroupDetail ? (
                        <></>
                    ) : (
                        <>
                            <Nav.Item className="ms-2">
                                <NavLink to={`/metrics/${groupId}`}>
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
                        <div
                            className={`d-flex flex-column align-items-center justify-content-center text-${statusColor}`}
                        >
                            <i
                                className={`group-status-icon fas fa-${statusIcon} my-2`}
                            />
                            <h1 className="mb-1 text-uppercase">
                                {value ?? "Unknown"}
                            </h1>
                            <small>
                                Last updated:{" "}
                                {secondsSinceLastUpdate === null
                                    ? "never"
                                    : `${formatTime(
                                          secondsSinceLastUpdate
                                      )} ago`}
                            </small>
                        </div>
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
