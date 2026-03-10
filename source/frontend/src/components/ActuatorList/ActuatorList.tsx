import { Col, Container, Row } from "react-bootstrap";
import { useAppSelector } from "../../store/store";
import { ActuatorToggle } from "../widgets/ActuatorToggle/ActuatorToggle";
import { WidgetLocation } from "../widgets/WidgetLocation";

export function ActuatorList() {
    const actuators = useAppSelector((state) => state.actuators);

    return (
        <Container className="my-3">
            <h1 className="text-center mb-3"><b>Actuators</b></h1>
            <Row className="g-3">
                {...Object.values(actuators).map((actuator) => (
                    <Col key={actuator.id} xs={12} xl={6}>
                        <ActuatorToggle
                            actuatorId={actuator.id}
                            location={WidgetLocation.ActuatorList}
                        />
                    </Col>
                ))}
            </Row>
        </Container>
    );
}
