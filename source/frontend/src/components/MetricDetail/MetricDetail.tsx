import { NavLink, useParams } from "react-router";
import {
    Button,
    ButtonToolbar,
    Card,
    Col,
    Collapse,
    Container,
    Nav,
    Row,
} from "react-bootstrap";
import { arrayLast } from "../../utils";
import { useState } from "react";
import { useAppSelector } from "../../store/store";
import { wrapMetricsInitialized } from "../../utils/wrapMetricsInitialized";
import { Status } from "../../store/GroupState";
import { MetricHistoryVis } from "../HistoryVis/MetricHistoryVis";
import { MetricStateVis } from "../MetricStateVis/MetricStateVis";
import type { MetricState } from "../../store/MetricState";

const statusClasses: Record<Status, string> = {
    [Status.Ok]: "success",
    [Status.Warning]: "warning",
};
const statusClass = (prefix: string, status: Status | null) =>
    status ? prefix + statusClasses[status] : "";

function MetricDetailHistory({ metric }: { metric: MetricState }) {
    const [isOpen, setOpen] = useState(true);

    return (
        <Card>
            <Card.Header className="pe-0">
                <Nav className="align-items-center me-2 ms-2">
                    <Nav.Item className="me-auto">
                        <h4 className="m-0">History</h4>
                    </Nav.Item>
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
        <Container fluid className="my-3">
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
                            <i className="fas fa-plus" />
                            <span className="ms-2 me-1">Add to Dashboard</span>
                        </Button>
                        <Button>
                            <i className="fas fa-file-circle-plus" />
                            <span className="ms-2 me-1">
                                Create Automation Rule
                            </span>
                        </Button>
                    </ButtonToolbar>
                </Col>
                <Col xs={12} lg={6}>
                    <MetricStateVis metric={metric} isDetail={true} />
                </Col>
                <Col xs={12}>
                    <MetricDetailHistory metric={metric} />
                </Col>
            </Row>
        </Container>
    );
});
