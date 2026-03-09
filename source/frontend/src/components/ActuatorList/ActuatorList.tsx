import { Col, Container, Row } from "react-bootstrap";
import { useAppSelector } from "../../store/store";
import { ActuatorToggle } from "../widgets/ActuatorToggle/ActuatorToggle";
import { WidgetLocation } from "../widgets/WidgetLocation";

export function ActuatorList() {
    const actuators = useAppSelector((state) => state.actuators);

    return (
        <Container className="my-3">
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
