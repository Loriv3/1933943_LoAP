import { Button, Card, Collapse, Nav } from "react-bootstrap";
import { arrayLast, formatUnit, useTimer } from "../../utils";
import { useState } from "react";
import type { MetricState } from "../../store/MetricState";
import { visualizerTypes } from "./visualizerTypes";
import { metricTypeIcons } from "../../metricTypeIcons";
import { NavLink } from "react-router";

export function MetricStateVis({
    metric,
    isDetail,
    ...props
}:
    | {
          metric: MetricState;
          isDetail: true;
      }
    | {
          metric: MetricState;
          groupId: string;
          isDetail: false;
      }) {
    const [isOpen, setOpen] = useState(true);
    const Visualizer = visualizerTypes[metric.type];
    const value = arrayLast(metric.measurements)?.value;

    const lastUpdate = metric.measurements.length
        ? new Date(
              metric.measurements[metric.measurements.length - 1].timestamp
          )
        : null;
    const secondsSinceLastUpdate = useTimer(lastUpdate);

    return (
        <Card>
            <Card.Header className="pe-0">
                <Nav className="justify-content-evenly align-items-center me-2 ms-2">
                    {isDetail ? (
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
                                    <b>{metric.name}</b>
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
                    {isDetail ? (
                        <></>
                    ) : (
                        <>
                            <Nav.Item>
                                <Button
                                    variant="primary"
                                    title="Add to Dashboard"
                                >
                                    <i className="fas fa-plus" />
                                </Button>
                            </Nav.Item>
                            <Nav.Item className="ms-2">
                                <NavLink
                                    to={`/groups/${
                                        (props as { groupId: string }).groupId
                                    }/${metric.id}`}
                                >
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
                            ""
                        )}
                        {isDetail ? (
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
