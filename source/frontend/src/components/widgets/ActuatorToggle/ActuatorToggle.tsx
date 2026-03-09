import { Button, Card, Collapse, Nav } from "react-bootstrap";
import { WidgetLocation } from "../WidgetLocation";
import { useAppSelector, useHasDashboardWidget } from "../../../store/store";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "../../../store/dashboard/DashboardWidget";
import { useDispatch } from "react-redux";
import { arrayLast, formatTime, useTimer } from "../../../utils";
import { useState } from "react";
import { addWidget, removeWidget } from "../../../store/dashboard/dashboard";
import { NavLink } from "react-router";
import { Toggle } from "./Toggle";
import {
    addActuatorUnknown,
    removeActuatorUnknown,
} from "../../../store/actuators/actuators";
import { ACTUATORS_API_URL } from "../../../env";

export function ActuatorToggle({
    actuatorId,
    location,
}: {
    actuatorId: string;
    location: WidgetLocation;
}) {
    const actuator = useAppSelector((state) => state.actuators[actuatorId]);

    const [isOpen, setOpen] = useState(true);
    const statusObj = arrayLast(actuator.history);
    const value = statusObj?.value ?? null;

    const lastUpdate = statusObj ? new Date(statusObj.timestamp) : null;
    const secondsSinceLastUpdate = useTimer(lastUpdate);

    const statusColor =
        value === null ? "secondary" : value ? "success" : "danger";

    const dashboardWidget = {
        variant: DashboardWidgetVariant.ActuatorToggle,
        actuatorId: actuator.id,
    } satisfies DashboardWidgetPath;
    const hasDashboardWidget = useHasDashboardWidget(dashboardWidget);

    const dispatch = useDispatch();

    const toggleState = () => {
        dispatch(addActuatorUnknown(actuatorId!));
        (async () => {
            try {
                await fetch(
                    `http://${ACTUATORS_API_URL}/api/actuators/${actuatorId!}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ is_on: value === false }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
            } catch (e) {
                console.error("Error while trying to modify toggle:", e);
                dispatch(removeActuatorUnknown(actuatorId!));
            }
        })();
    };

    return (
        <Card>
            <Card.Header className="pe-0">
                <Nav className="justify-content-evenly align-items-center me-2 ms-2">
                    <Nav.Item>
                        <h4 className="m-0">
                            {location == WidgetLocation.ActuatorDetail
                                ? "Status"
                                : actuator.name}
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
                                <b>{value ? "ON" : "OFF"}</b>
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
                    {location === WidgetLocation.ActuatorDetail ? (
                        <></>
                    ) : (
                        <>
                            <Nav.Item className="ms-2">
                                <NavLink to={`/actuators/${actuatorId}`}>
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
                        <div className="d-flex justify-content-center align-items-center">
                            <Toggle
                                state={value}
                                size={2}
                                onClick={toggleState}
                            />
                            <div
                                className={`ms-4 d-flex flex-column justify-content-center align-items-center text-${statusColor}`}
                            >
                                <h1 className="mb-1 text-uppercase">
                                    {value === null
                                        ? "unknown"
                                        : value
                                        ? "on"
                                        : "off"}
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
                        </div>
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
