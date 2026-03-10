package marsops.automation.domain;

import java.util.Date;
import java.util.UUID;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ActuatorCommand {
    private final Date updatedAt;
    private final String actuatorId;
    private final boolean isOn;
    private final UUID ruleId;
    private final Reason reason;

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Reason {
        private final String groupId;
        private final String metricId;
        private final Object value;
        private final String unit;
        private final Operator operator;
        private final Object compareValue;
    }
}
