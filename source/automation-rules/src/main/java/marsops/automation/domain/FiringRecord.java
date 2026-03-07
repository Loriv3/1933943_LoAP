package marsops.automation.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FiringRecord {

    private final String id;
    private final String ruleId;
    private final String firedAt;
    private final String sensorName;
    private final double sensorValue;
    private final String actuatorName;
    private final String targetState;

    public FiringRecord(String id,
                        String ruleId,
                        String firedAt,
                        String sensorName,
                        double sensorValue,
                        String actuatorName,
                        String targetState) {
        this.id = id;
        this.ruleId = ruleId;
        this.firedAt = firedAt;
        this.sensorName = sensorName;
        this.sensorValue = sensorValue;
        this.actuatorName = actuatorName;
        this.targetState = targetState;
    }

    public String getId() {
        return id;
    }

    @JsonProperty("rule_id")
    public String getRuleId() {
        return ruleId;
    }

    @JsonProperty("fired_at")
    public String getFiredAt() {
        return firedAt;
    }

    @JsonProperty("sensor_name")
    public String getSensorName() {
        return sensorName;
    }

    @JsonProperty("sensor_value")
    public double getSensorValue() {
        return sensorValue;
    }

    @JsonProperty("actuator_name")
    public String getActuatorName() {
        return actuatorName;
    }

    @JsonProperty("target_state")
    public String getTargetState() {
        return targetState;
    }
}
