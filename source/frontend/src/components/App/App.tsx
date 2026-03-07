import { NavLink, Outlet, useLocation } from "react-router";
import "./App.css";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addGroup, addGroupValue } from "../../store/metrics";
import { testData, testGroups } from "../../store/testData";
import { markMetricsInitialized } from "../../store/init";

function App() {
    const location = useLocation();

    const dispatch = useDispatch();

    useEffect(() => {
        for (const group of testGroups) {
            dispatch(addGroup(group));
        }
        dispatch(markMetricsInitialized());
        for (const data of testData()) {
            dispatch(addGroupValue(data));
        }
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            for (const data of testData()) {
                dispatch(addGroupValue(data));
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

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
                </Container>
            </Navbar>
            <div className="app-content">
                <Outlet />
            </div>
        </div>
    );
}

export default App;
