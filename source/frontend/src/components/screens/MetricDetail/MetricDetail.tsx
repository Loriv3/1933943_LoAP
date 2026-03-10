import { NavLink, useParams } from "react-router";
import { Button, ButtonToolbar, Col, Container, Row } from "react-bootstrap";
import { arrayLast } from "../../../utils";
import { useAppSelector } from "../../../store/store";
import { wrapMetricsInitialized } from "../../../utils/wrapMetricsInitialized";
import { Status } from "../../../store/metrics/GroupHistory";
import { WidgetLocation } from "../../widgets/WidgetLocation";
import { MetricState } from "../../widgets/MetricState/MetricState";
import { MetricStateHistory } from "../../widgets/MetricStateHistory/MetricStateHistory";

const statusClasses: Record<Status, string> = {
    [Status.Ok]: "success",
    [Status.Warning]: "warning",
};
const statusClass = (prefix: string, status: Status | null) =>
    status ? prefix + statusClasses[status] : "";

export const MetricDetail = wrapMetricsInitialized(() => {
    const { groupId, metricId } =
        useParams<Record<"groupId" | "metricId", string>>();

    const groupName = useAppSelector((state) => state.metrics[groupId!].name);
    const groupStatus = useAppSelector(
        (state) => arrayLast(state.metrics[groupId!].statuses)?.value
    );
    const metric = useAppSelector(
        (state) => state.metrics[groupId!].metrics[metricId!]
    );

    return (
        <Container className="py-3">
            <Row className="g-3">
                <Col
                    xs={12}
                    lg={6}
                    className="d-flex flex-column justify-content-center"
                >
                    <div className="text-center mt-3">
                        <NavLink
                            relative="path"
                            to={".."}
                            style={{ textDecoration: "none" }}
                        >
                            <Button
                                size="sm"
                                variant="outline-dark py-0 mb-2 opacity-50"
                            >
                                <small>
                                    <span>{groupName}</span>
                                    {groupStatus ? (
                                        <div
                                            className={`text-uppercase ${statusClass(
                                                "text-",
                                                groupStatus
                                            )}`}
                                        >
                                            {groupStatus}
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </small>
                            </Button>
                        </NavLink>
                        <h1 className="mb-3">
                            <b>{metric.name}</b>
                        </h1>
                    </div>
                    <ButtonToolbar className="justify-content-center mb-3 gap-2">
                        <Button>
                            <i className="fas fa-file-circle-plus" />
                            <span className="ms-2 me-1">
                                Create Automation Rule
                            </span>
                        </Button>
                    </ButtonToolbar>
                </Col>
                <Col xs={12} lg={6}>
                    <MetricState
                        metricId={metricId!}
                        groupId={groupId!}
                        location={WidgetLocation.MetricDetail}
                    />
                </Col>
                <Col xs={12}>
                    <MetricStateHistory
                        metricId={metricId!}
                        groupId={groupId!}
                        location={WidgetLocation.MetricDetail}
                    />
                </Col>
            </Row>
        </Container>
    );
});
