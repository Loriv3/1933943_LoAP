import { useDispatch } from "react-redux";
import { WidgetLocation } from "../WidgetLocation";
import { useState } from "react";
import { useAppSelector, useHasDashboardWidget } from "../../../store/store";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "../../../store/dashboard/DashboardWidget";
import { Button, Card, Collapse, Nav } from "react-bootstrap";
import { addWidget, removeWidget } from "../../../store/dashboard/dashboard";
import { NavLink } from "react-router";
import { ToggleHistoryVis } from "../../HistoryVis/ToggleHistoryVis";

export function ActuatorHistory({
    actuatorId,
    location,
}: {
    actuatorId: string;
    location: WidgetLocation;
}) {
    const actuator = useAppSelector((state) => state.actuators[actuatorId!]);

    const [isOpen, setOpen] = useState(true);

    const dispatch = useDispatch();
    const dashboardWidget = {
        variant: DashboardWidgetVariant.ActuatorHistory,
        actuatorId: actuatorId!,
    } satisfies DashboardWidgetPath;
    const hasDashboardWidget = useHasDashboardWidget(dashboardWidget);

    return (
        <Card>
            <Card.Header className="pe-0">
                <Nav className="align-items-center me-2 ms-2">
                    <Nav.Item className="me-auto ms-3">
                        <h4 className="m-0">
                            <b>
                                {location === WidgetLocation.ActuatorDetail
                                    ? "Status"
                                    : actuator.name}{" "}
                                History
                            </b>
                        </h4>
                    </Nav.Item>
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
                        <ToggleHistoryVis data={actuator.history!} />
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}
