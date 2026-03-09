import { createSlice } from "@reduxjs/toolkit";
import { dropTimeSeriesData } from "../../utils";
import type { ActuatorHistory, ActuatorSpec } from "./ActuatorHistory";

export const MAX_HISTORY_SIZE = 100;

export interface AddActuatorValue {
    actuatorId: string;
    date: Date;
    value: boolean;
}

export const actuatorsSlice = createSlice({
    name: "actuators",
    initialState: {} as Record<string, ActuatorHistory>,
    reducers: {
        addActuatorValue: (
            state,
            {
                payload: { actuatorId, date, value },
            }: {
                payload: AddActuatorValue;
            }
        ) => {
            if (!(actuatorId in state)) return;
            const actuator = state[actuatorId];
            actuator.history.push({ value, timestamp: date.getTime() });
            dropTimeSeriesData(actuator.history, MAX_HISTORY_SIZE);
        },
        addActuator: (
            state,
            {
                payload: actuatorSpec,
            }: {
                payload: ActuatorSpec;
            }
        ) => {
            state[actuatorSpec.id] = {
                id: actuatorSpec.id,
                name: actuatorSpec.name,
                history: [],
            };
        },
    },
});

export const { addActuatorValue, addActuator } = actuatorsSlice.actions;
export const actuatorsReducer = actuatorsSlice.reducer;
