import type { ActuatorSpec } from "../store/actuators/ActuatorHistory";

export interface ApiActuatorSpec {
    actuator_id: string;
    name: string;
}

export const convertApiActuatorSpecToInternal = (
    data: ApiActuatorSpec
): ActuatorSpec => {
    return {
        id: data.actuator_id,
        name: data.name,
    };
};
