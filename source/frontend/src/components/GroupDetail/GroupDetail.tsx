import "./GroupDetail.css";

import { useParams } from "react-router";
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
import {
    arrayLast,
    useTimer,
} from "../../utils";
import { useState } from "react";
import { useAppSelector } from "../../store/store";
import { wrapMetricsInitialized } from "../../utils/wrapMetricsInitialized";
import { Status, type GroupState } from "../../store/GroupState";
import { MetricStateVis } from "../MetricStateVis/MetricStateVis";
import { StatusHistoryVis } from "../HistoryVis/StatusHistoryVis";

const statusToBootstrapColor = {
    [Status.Ok]: "success",
    [Status.Warning]: "warning",
};
const statusToIcon = {
    [Status.Ok]: "check-circle",
    [Status.Warning]: "warning",
};

function GroupDetailStatus({ group }: { group: GroupState }) {
    const [isOpen, setOpen] = useState(true);
    const statusObj = arrayLast(group.statuses);
    const value = statusObj?.value;
    const statusColor = value ? statusToBootstrapColor[value] : "secondary";
    const statusIcon = value ? statusToIcon[value] : "question";

    const lastUpdate = statusObj ? new Date(statusObj.timestamp) : null;
    const secondsSinceLastUpdate = useTimer(lastUpdate);

    return (
        <Card
            className={
                value
                    ? `border-${statusColor} text-${statusColor}-emphasis`
                    : ""
            }
        >
            <Card.Header className="pe-0">
                <Nav className="justify-content-evenly align-items-center me-2 ms-2">
                    <Nav.Item>
                        <h4 className="m-0">Status</h4>
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
                        <Button variant="primary" title="Add to Dashboard">
                            <i className="fas fa-plus" />
                        </Button>
                    </Nav.Item>
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
                            className={`d-flex flex-column align-items-center group-detail-status-${value}`}
                        >
                            <i
                                className={`group-detail-status-icon fas fa-${statusIcon} my-2`}
                            />
                            <h1 className="mb-1 text-uppercase">
                                {value ?? "Unknown"}
                            </h1>
                            <small>
                                Last updated:{" "}
                                {secondsSinceLastUpdate === null
                                    ? "never"
                                    : `${secondsSinceLastUpdate} s ago`}
                            </small>
                        </div>
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}

function GroupDetailStatusHistory({ group }: { group: GroupState }) {
    const [isOpen, setOpen] = useState(true);

    return (
        <Card>
            <Card.Header className="pe-0">
                <Nav className="align-items-center me-2 ms-2">
                    <Nav.Item className="me-auto ms-3">
                        <h4 className="m-0">
                            <b>Status History</b>
                        </h4>
                    </Nav.Item>
                    <Nav.Item>
                        <Button variant="primary" title="Add to Dashboard">
                            <i className="fas fa-plus" />
                        </Button>
                    </Nav.Item>
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
                        <StatusHistoryVis data={group.statuses!} />
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}

export const GroupDetail = wrapMetricsInitialized(() => {
    const { groupId } = useParams<Record<"groupId", string>>();

    const group = useAppSelector((state) => state.metrics[groupId!]);
    const groupStatus = arrayLast(group.statuses)?.value;

    return (
        <Container
            fluid
            className={`py-3 group-detail ${
                groupStatus
                    ? `bg-${statusToBootstrapColor[groupStatus]}-subtle`
                    : ""
            }`}
        >
            <Row className="g-3">
                <Col
                    xs={12}
                    lg={6}
                    className="d-flex flex-column justify-content-center"
                >
                    <h1 className="text-center m-3">
                        <b>{group.name}</b>
                    </h1>
                    <ButtonToolbar className="justify-content-center mb-4">
                        <Button>
                            <i className="fas fa-plus" />
                            <span className="ms-2 me-2">Add to Dashboard</span>
                        </Button>
                    </ButtonToolbar>
                </Col>
                {group.statuses ? (
                    <Col xs={12} lg={6}>
                        <GroupDetailStatus group={group} />
                    </Col>
                ) : (
                    ""
                )}
                {...Object.values(group.metrics).map((metric) => (
                    <Col key={metric.id} xs={12} xl={6}>
                        <MetricStateVis
                            metric={metric}
                            isDetail={false}
                            groupId={groupId!}
                        />
                    </Col>
                ))}
                <Col xs={12} xl={6}>
                    {group.statuses ? (
                        <GroupDetailStatusHistory group={group} />
                    ) : (
                        ""
                    )}
                </Col>
            </Row>
        </Container>
    );
});
