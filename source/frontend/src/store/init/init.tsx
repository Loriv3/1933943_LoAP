import { createSlice } from "@reduxjs/toolkit";

export interface InitState {
    metricsAreInitialized: boolean;
}

export const initSlice = createSlice({
    name: "init",
    initialState: {
        metricsAreInitialized: false,
    } as InitState,
    reducers: {
        markMetricsInitialized: (state) => {
            state.metricsAreInitialized = true;
        },
    },
});

export const { markMetricsInitialized } = initSlice.actions;
export const initReducer = initSlice.reducer;
