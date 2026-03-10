package marsops.automation.domain;

import java.util.Date;
import java.util.UUID;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Rule {
    private final UUID id;
    private final boolean enabled;
    private final Date createdAt;
    private final Date updatedAt;

    private final String groupId;
    private final String metricId;
    private final Operator operator;
    private final Object compareValue;
    private final String unit;
    private final String actuatorId;
    private final boolean actuatorState;
}
