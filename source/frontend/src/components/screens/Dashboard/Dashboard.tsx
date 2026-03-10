import { Col, Container, Row } from "react-bootstrap";
import { dashboardWidgetId } from "../../../store/dashboard/dashboard";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "../../../store/dashboard/DashboardWidget";
import { useDashboardWidgetsOrdered } from "../../../store/store";
import { GroupStatus } from "../../widgets/GroupStatus/GroupStatus";
import { GroupStatusHistory } from "../../widgets/GroupStatusHistory/GroupStatusHistory";
import { WidgetLocation } from "../../widgets/WidgetLocation";
import { MetricState } from "../../widgets/MetricState/MetricState";
import { MetricStateHistory } from "../../widgets/MetricStateHistory/MetricStateHistory";
import { NavLink } from "react-router";
import { ActuatorToggle } from "../../widgets/ActuatorToggle/ActuatorToggle";
import { ActuatorHistory } from "../../widgets/ActuatorHistory/ActuatorHistory";

function widgetToVis(widget: DashboardWidgetPath) {
    switch (widget.variant) {
        case DashboardWidgetVariant.GroupStatus:
            return (
                <GroupStatus
                    key={dashboardWidgetId(widget)}
                    groupId={widget.groupId}
                    location={WidgetLocation.Dashboard}
                />
            );
        case DashboardWidgetVariant.GroupStatusHistory:
            return (
                <GroupStatusHistory
                    key={dashboardWidgetId(widget)}
                    groupId={widget.groupId}
                    location={WidgetLocation.Dashboard}
                />
            );
        case DashboardWidgetVariant.MetricState:
            return (
                <MetricState
                    key={dashboardWidgetId(widget)}
                    groupId={widget.groupId}
                    metricId={widget.metricId}
                    location={WidgetLocation.Dashboard}
                />
            );
        case DashboardWidgetVariant.MetricStateHistory:
            return (
                <MetricStateHistory
                    key={dashboardWidgetId(widget)}
                    groupId={widget.groupId}
                    metricId={widget.metricId}
                    location={WidgetLocation.Dashboard}
                />
            );
        case DashboardWidgetVariant.ActuatorToggle:
            return (
                <ActuatorToggle
                    key={dashboardWidgetId(widget)}
                    actuatorId={widget.actuatorId}
                    location={WidgetLocation.Dashboard}
                />
            );
        case DashboardWidgetVariant.ActuatorHistory:
            return (
                <ActuatorHistory
                    key={dashboardWidgetId(widget)}
                    actuatorId={widget.actuatorId}
                    location={WidgetLocation.Dashboard}
                />
            );
    }
}

export function Dashboard() {
    const dashboardWidgets = useDashboardWidgetsOrdered();

    return (
        <Container className="my-3">
            <Row className="g-3">
                {dashboardWidgets.length ? (
                    dashboardWidgets.map((widget) => (
                        <Col xs={12} xl={6}>
                            {widgetToVis(widget)}
                        </Col>
                    ))
                ) : (
                    <div className="text-center py-3">
                        <h1 className="mb-3">
                            <b>The dashboard is currently empty...</b>
                        </h1>
                        <h3 className="text-muted">
                            Go to{" "}
                            <NavLink
                                to="/metrics"
                                className="text-decoration-none"
                            >
                                Metrics
                            </NavLink>{" "}
                            or{" "}
                            <NavLink
                                to="actuators"
                                className="text-decoration-none"
                            >
                                Actuators
                            </NavLink>{" "}
                            to add widgets!
                        </h3>
                    </div>
                )}
            </Row>
        </Container>
    );
}
