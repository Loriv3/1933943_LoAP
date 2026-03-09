export interface ActuatorData {
    value: boolean | null;
    timestamp: number;
}

export interface ActuatorSpec {
    id: string;
    name: string;
}

export interface ActuatorHistory extends ActuatorSpec {
    history: ActuatorData[];
}
