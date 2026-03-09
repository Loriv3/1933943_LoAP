import { NavLink, Outlet, useLocation } from "react-router";
import "./App.css";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addGroup, addGroupValue } from "../../store/metrics/metrics";
import { markMetricsInitialized } from "../../store/init/init";
import { useWebSocket } from "../../api/websocket";
import { METRICS_API_URL } from "../../env";
import { convertApiGroupDataToInternal } from "../../api/ApiGroupValue";
import {
    convertApiGroupSpecToInternal,
    type ApiGroupSpec,
} from "../../api/ApiGroupSpec";
import { useAppSelector } from "../../store/store";

function AppInner() {
    const location = useLocation();
    const dispatch = useDispatch();

    useWebSocket(`ws://${METRICS_API_URL}/api/metrics/ws`, (data: string) => {
        const convertedData = convertApiGroupDataToInternal(JSON.parse(data));
        dispatch(addGroupValue(convertedData));
    });

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
                        <Nav.Link as={NavLink} to="/groups">
                            Groups
                        </Nav.Link>
                    </Nav>
                    <span
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "green",
                            display: "inline-block",
                        }} />
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
            const data: ApiGroupSpec[] = await (
                await fetch(`http://${METRICS_API_URL}/api/metrics/discover`)
            ).json();
            for (const group of data) {
                dispatch(addGroup(convertApiGroupSpecToInternal(group)));
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
