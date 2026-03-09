import { configureStore } from "@reduxjs/toolkit";
import { metricsReducer } from "./metrics/metrics";
import { useDispatch, useSelector } from "react-redux";
import { initReducer } from "./init/init";
import { dashboardReducer, dashboardWidgetId } from "./dashboard/dashboard";
import type { DashboardWidgetPath } from "./dashboard/DashboardWidget";
import { actuatorsReducer } from "./actuators/actuators";

export const store = configureStore({
    reducer: {
        metrics: metricsReducer,
        actuators: actuatorsReducer,
        init: initReducer,
        dashboard: dashboardReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["metrics/addGroupValue", "actuators/addActuatorValue"],
            },
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useHasDashboardWidget = (path: DashboardWidgetPath) =>
    useAppSelector(
        (state) => dashboardWidgetId(path) in state.dashboard.orderById
    );

export const useHasDashboardWidgets = (paths: DashboardWidgetPath[]) =>
    useAppSelector(
        (state) =>
            paths.map(
                (path) => dashboardWidgetId(path) in state.dashboard.orderById
            ),
        (a, b) => a.every((ae, i) => ae === b[i])
    );

export const useDashboardWidgets = () =>
    useAppSelector((state) => state.dashboard.orderById);

export const useDashboardWidgetsOrdered = () =>
    useAppSelector((state) => state.dashboard.pathsByOrder);
