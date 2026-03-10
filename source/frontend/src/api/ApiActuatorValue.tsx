import type { AddActuatorValue } from "../store/actuators/actuators";

export interface ApiActuatorValue {
    actuator_id: string;
    is_on: boolean;
    updated_at: string;
}

export const convertApiActuatorValueToInternal = (
    data: ApiActuatorValue
): AddActuatorValue => {
    return {
        actuatorId: data.actuator_id,
        value: data.is_on,
        date: new Date(data.updated_at),
    };
};
