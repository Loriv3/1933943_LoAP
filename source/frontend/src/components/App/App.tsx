import { NavLink, Outlet, useLocation } from "react-router";
import "./App.css";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addGroup, addGroupValue } from "../../store/metrics/metrics";
import { markMetricsInitialized } from "../../store/init/init";
import {
    useWebSocket,
    WebsocketStatus as WebSocketStatus,
} from "../../api/websocket";
import { ACTUATORS_API_URL, METRICS_API_URL } from "../../env";
import {
    convertApiGroupDataToInternal,
    type ApiGroupValue,
} from "../../api/ApiGroupValue";
import {
    convertApiGroupSpecToInternal,
    type ApiGroupSpec,
} from "../../api/ApiGroupSpec";
import { useAppSelector } from "../../store/store";
import {
    convertApiActuatorSpecToInternal,
    type ApiActuatorSpec,
} from "../../api/ApiActuatorSpec";
import { addActuator, addActuatorValue } from "../../store/actuators/actuators";
import {
    convertApiActuatorValueToInternal,
    type ApiActuatorValue,
} from "../../api/ApiActuatorValue";

function AppInner() {
    const location = useLocation();
    const dispatch = useDispatch();

    const metricsStatus = useWebSocket(
        `ws://${METRICS_API_URL}/api/metrics/ws`,
        (data: string) => {
            const convertedData = convertApiGroupDataToInternal(
                JSON.parse(data) as ApiGroupValue
            );
            dispatch(addGroupValue(convertedData));
        }
    );

    const actuatorsStatus = useWebSocket(
        `ws://${ACTUATORS_API_URL}/api/actuators/ws`,
        (data: string) => {
            const convertedData = convertApiActuatorValueToInternal(
                JSON.parse(data) as ApiActuatorValue
            );
            dispatch(addActuatorValue(convertedData));
        }
    );

    const webSocketStatusText = {
        [WebSocketStatus.Disconnected]: "Disconnected",
        [WebSocketStatus.Connecting]: "Connecting",
        [WebSocketStatus.Connected]: "Connected",
        [WebSocketStatus.Disconnecting]: "Disconnecting",
    };
    const webSocketStatusColor = {
        [WebSocketStatus.Disconnected]: "danger",
        [WebSocketStatus.Connecting]: "warning",
        [WebSocketStatus.Connected]: "success",
        [WebSocketStatus.Disconnecting]: "warning",
    };
    const websocketsStatus = `Metrics: ${webSocketStatusText[metricsStatus]}\nActuators: ${webSocketStatusText[actuatorsStatus]}`;

    return (
        <div className="app">
            <Navbar bg="body-secondary">
                <Container fluid>
                    <Navbar.Brand as={NavLink} to="/">
                        <h1 className="m-0">
                            <b>MarsOps</b>
                        </h1>
                    </Navbar.Brand>
                    <Nav activeKey={location.pathname} className="me-auto">
                        <Nav.Link as={NavLink} to="/dashboard">
                            Dashboard
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/metrics">
                            Metrics
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/actuators">
                            Actuators
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/automations">
                            Automations
                        </Nav.Link>
                    </Nav>
                    <Nav.Item
                        className="me-3 d-flex navbar-status"
                        title={websocketsStatus}
                    >
                        <div
                            className={`navbar-status-metrics bg-${webSocketStatusColor[metricsStatus]}`}
                        />
                        <div
                            className={`navbar-status-actuators bg-${webSocketStatusColor[actuatorsStatus]}`}
                        />
                    </Nav.Item>
                </Container>
            </Navbar>
            <div className="app-content">
                <Outlet />
            </div>
        </div>
    );
}

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            const metricsData: ApiGroupSpec[] = await (
                await fetch(`http://${METRICS_API_URL}/api/metrics/discover`)
            ).json();
            for (const metricsGroup of metricsData) {
                dispatch(addGroup(convertApiGroupSpecToInternal(metricsGroup)));
            }
            const actuatorData: ApiActuatorSpec[] = await (
                await fetch(
                    `http://${ACTUATORS_API_URL}/api/actuators/discover`
                )
            ).json();
            for (const actuator of actuatorData) {
                dispatch(
                    addActuator(convertApiActuatorSpecToInternal(actuator))
                );
            }
            dispatch(markMetricsInitialized());
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const metricsAreInitialized = useAppSelector(
        (state) => state.init.metricsAreInitialized
    );

    return metricsAreInitialized ? <AppInner /> : <></>;
}

export default App;
