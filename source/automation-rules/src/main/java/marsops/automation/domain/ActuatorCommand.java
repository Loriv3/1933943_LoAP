package marsops.automation.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ActuatorCommand {

    private final String issuedAt;
    private final String actuatorName;
    private final String state;
    private final String ruleId;
    private final Reason reason;

    public ActuatorCommand(String issuedAt,
                           String actuatorName,
                           String state,
                           String ruleId,
                           Reason reason) {
        this.issuedAt = issuedAt;
        this.actuatorName = actuatorName;
        this.state = state;
        this.ruleId = ruleId;
        this.reason = reason;
    }

    @JsonProperty("issued_at")
    public String getIssuedAt() {
        return issuedAt;
    }

    @JsonProperty("actuator_name")
    public String getActuatorName() {
        return actuatorName;
    }

    @JsonProperty("actuator_id")
    public String getActuatorId() {
        return actuatorName;
    }

    public String getState() {
        return state;
    }

    @JsonProperty("is_on")
    public boolean isOn() {
        return "ON".equalsIgnoreCase(state);
    }

    @JsonProperty("updated_at")
    public String getUpdatedAt() {
        return issuedAt;
    }

    @JsonProperty("rule_id")
    public String getRuleId() {
        return ruleId;
    }

    public Reason getReason() {
        return reason;
    }

    public static class Reason {

        private final String sensorName;
        private final Double value;
        private final String operator;
        private final double threshold;

        public Reason(String sensorName, Double value, String operator, double threshold) {
            this.sensorName = sensorName;
            this.value = value;
            this.operator = operator;
            this.threshold = threshold;
        }

        @JsonProperty("sensor_name")
        public String getSensorName() {
            return sensorName;
        }

        public Double getValue() {
            return value;
        }

        public String getOperator() {
            return operator;
        }

        public double getThreshold() {
            return threshold;
        }
    }
}
