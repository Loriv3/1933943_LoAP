import { Col, Container, Row } from "react-bootstrap";
import { dashboardWidgetId } from "../../store/dashboard/dashboard";
import {
    DashboardWidgetVariant,
    type DashboardWidgetPath,
} from "../../store/dashboard/DashboardWidget";
import { useDashboardWidgetsOrdered } from "../../store/store";
import { GroupStatus } from "../widgets/GroupStatus/GroupStatus";
import { GroupStatusHistory } from "../widgets/GroupStatusHistory/GroupStatusHistory";
import { WidgetLocation } from "../widgets/WidgetLocation";
import { MetricState } from "../widgets/MetricState/MetricState";
import { MetricStateHistory } from "../widgets/MetricStateHistory/MetricStateHistory";

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
    }
}

export function Dashboard() {
    const dashboardWidgets = useDashboardWidgetsOrdered();

    return (
        <Container className="my-3">
            <Row className="g-3">
                {dashboardWidgets.map((widget) => (
                    <Col xs={12} xl={6}>
                        {widgetToVis(widget)}
                    </Col>
                ))}
            </Row>
        </Container>
    );
}
