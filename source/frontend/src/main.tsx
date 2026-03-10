import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./resources/fontawesome-free-7.2.0-web/css/all.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App/App.tsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Dashboard } from "./components/Dashboard/Dashboard.tsx";
import { GroupList } from "./components/GroupList/GroupList.tsx";
import { GroupDetail } from "./components/GroupDetail/GroupDetail.tsx";
import { MetricDetail } from "./components/MetricDetail/MetricDetail.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.tsx";
import { registerChartBasics } from "./utils.tsx";
import { ActuatorList } from "./components/ActuatorList/ActuatorList.tsx";
import { ActuatorDetail } from "./components/ActuatorDetail/ActuatorDetail.tsx";
import { Automations } from "./components/Automations/AutomationRules.tsx";

registerChartBasics();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route element={<App />}>
                        <Route
                            index
                            element={<Navigate to="/dashboard" />}
                        ></Route>
                        <Route
                            index
                            path="/dashboard"
                            element={<Dashboard />}
                        ></Route>
                        <Route path="/metrics" element={<GroupList />} />
                        <Route
                            path="/metrics/:groupId"
                            element={<GroupDetail />}
                        />
                        <Route
                            path="/metrics/:groupId/:metricId"
                            element={<MetricDetail />}
                        />
                        <Route path="/actuators" element={<ActuatorList />} />
                        <Route
                            path="/actuators/:actuatorId"
                            element={<ActuatorDetail />}
                        />
                        <Route path="/automations" element={<Automations />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </Provider>
    </StrictMode>
);
