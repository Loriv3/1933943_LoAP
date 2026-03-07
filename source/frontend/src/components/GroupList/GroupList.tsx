import { Button, Card, Col, ListGroup, Nav, Row } from "react-bootstrap";
import { NavLink } from "react-router";
import { metricTypeIcons } from "../../metricTypeIcons";
import { useAppSelector } from "../../store/store";
import { wrapMetricsInitialized } from "../../utils/wrapMetricsInitialized";
import { formatUnit } from "../../utils";

export const GroupList = wrapMetricsInitialized(() => {
    const groups = useAppSelector((state) => state.metrics);

    return (
        <Row className="g-4 m-2">
            {...Object.values(groups).map((group) => (
                <Col xs={12} sm={12} md={6} lg={6} xl={4} key={group.id}>
                    <Card className="h-100">
                        <Card.Header className="p-0 py-1">
                            <Nav className="align-items-center me-2 ms-3 g-2 flex-nowrap">
                                <Nav.Item className="me-auto my-2">
                                    <h4 className="mb-0">
                                        <b>{group.name}</b>
                                    </h4>
                                    {group.subtitle ? (
                                        <>
                                            <small className="text-muted">
                                                {group.subtitle}
                                            </small>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </Nav.Item>
                                <Nav.Item>
                                    <Button
                                        variant="primary"
                                        title="Add to Dashboard"
                                    >
                                        <i className="fas fa-plus" />
                                    </Button>
                                </Nav.Item>
                                <Nav.Item className="ms-1">
                                    <NavLink to={`/groups/${group.id}`}>
                                        <Button
                                            variant="secondary"
                                            title="Show Detail"
                                        >
                                            <i className="fas fa-chevron-right" />
                                        </Button>
                                    </NavLink>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {...Object.values(group.metrics).map((metric) => (
                                <ListGroup.Item className="p-0" key={metric.id}>
                                    <Nav className="align-items-center me-2 ms-2">
                                        <Nav.Item>
                                            <i
                                                className={`fas fa-${
                                                    metricTypeIcons[metric.type]
                                                }`}
                                            />
                                        </Nav.Item>
                                        <Nav.Item className="me-auto my-2 ms-2">
                                            <h6 className="mb-0 font-weight-bold">
                                                {metric.name}
                                            </h6>
                                        </Nav.Item>
                                        <Nav.Item className="mx-4 text-muted">
                                            {metric.measurements.length
                                                ? `${metric.measurements[
                                                      metric.measurements
                                                          .length - 1
                                                  ].value
                                                      .map((v, i) =>
                                                          formatUnit(
                                                              v,
                                                              metric.unit[i]
                                                          )
                                                      )
                                                      .join(", ")}`
                                                : ""}
                                        </Nav.Item>
                                        <Nav.Item className="ms-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="p-0 px-1"
                                                title="Add to Dashboard"
                                            >
                                                <i className="fas fa-plus" />
                                            </Button>
                                        </Nav.Item>
                                        <Nav.Item className="ms-2">
                                            <NavLink
                                                to={`/groups/${group.id}/${metric.id}`}
                                            >
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="p-0 px-1"
                                                    title="Show Detail"
                                                >
                                                    <i className="fas fa-chevron-right" />
                                                </Button>
                                            </NavLink>
                                        </Nav.Item>
                                    </Nav>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
            ))}
        </Row>
    );
});
