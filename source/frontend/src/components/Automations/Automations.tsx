import { Button, Card, Container, Row } from "react-bootstrap";
import { AutomationRuleEditor } from "./AutomationRuleEditor";

export function Automations() {
    return (
        <Container className="my-3">
            <h1 className="text-center mb-3">
                <b>Automations</b>
            </h1>
            <Row className="g-3">
                <Card className="pasdfa p-0">
                    <Card.Body className="d-flex flex-row p-0">
                        <div className="flex-fill p-3 ps-4">
                            <AutomationRuleEditor />
                        </div>
                        <div className="px-3 d-flex justify-content-center align-items-center gap-2">
                            <Button variant="primary">
                                <i className="fas fa-pencil" />
                            </Button>
                            <Button variant="danger">
                                <i className="fas fa-minus" />
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Row>
        </Container>
    );
}
