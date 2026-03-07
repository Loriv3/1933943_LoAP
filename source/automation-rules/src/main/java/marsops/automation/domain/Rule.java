package marsops.automation.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Rule {

    private final String id;
    private final boolean enabled;
    private final String sensorName;
    private final String operator;
    private final double thresholdValue;
    private final String unit;
    private final String actuatorName;
    private final String targetState;
    private final String createdAt;
    private final String updatedAt;

    public Rule(String id,
                boolean enabled,
                String sensorName,
                String operator,
                double thresholdValue,
                String unit,
                String actuatorName,
                String targetState,
                String createdAt,
                String updatedAt) {
        this.id = id;
        this.enabled = enabled;
        this.sensorName = sensorName;
        this.operator = operator;
        this.thresholdValue = thresholdValue;
        this.unit = unit;
        this.actuatorName = actuatorName;
        this.targetState = targetState;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public boolean isEnabled() {
        return enabled;
    }

    @JsonProperty("sensor_name")
    public String getSensorName() {
        return sensorName;
    }

    public String getOperator() {
        return operator;
    }

    @JsonProperty("threshold_value")
    public double getThresholdValue() {
        return thresholdValue;
    }

    public String getUnit() {
        return unit;
    }

    @JsonProperty("actuator_name")
    public String getActuatorName() {
        return actuatorName;
    }

    @JsonProperty("target_state")
    public String getTargetState() {
        return targetState;
    }

    @JsonProperty("created_at")
    public String getCreatedAt() {
        return createdAt;
    }

    @JsonProperty("updated_at")
    public String getUpdatedAt() {
        return updatedAt;
    }
}
