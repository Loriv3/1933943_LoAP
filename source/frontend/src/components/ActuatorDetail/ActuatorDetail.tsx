import { useParams } from "react-router";
import { useAppSelector } from "../../store/store";
import { Button, ButtonToolbar, Col, Container, Row } from "react-bootstrap";
import { ActuatorToggle } from "../widgets/ActuatorToggle/ActuatorToggle";
import { WidgetLocation } from "../widgets/WidgetLocation";
import { ActuatorHistory } from "../widgets/ActuatorHistory/ActuatorHistory";

export function ActuatorDetail() {
    const { actuatorId } = useParams<Record<"actuatorId", string>>();

    const actuator = useAppSelector((state) => state.actuators[actuatorId!]);

    return (
        <Container className="my-3">
            <Row className="g-3">
                <Col
                    xs={12}
                    lg={6}
                    className="d-flex flex-column justify-content-center"
                >
                    <div className="text-center mt-3">
                        <h1 className="mb-3">
                            <b>{actuator.name}</b>
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
                    <ActuatorToggle
                        actuatorId={actuatorId!}
                        location={WidgetLocation.ActuatorDetail}
                    />
                </Col>
                <Col xs={12}>
                    <ActuatorHistory
                        actuatorId={actuatorId!}
                        location={WidgetLocation.ActuatorDetail}
                    />
                </Col>
            </Row>
        </Container>
    );
}
