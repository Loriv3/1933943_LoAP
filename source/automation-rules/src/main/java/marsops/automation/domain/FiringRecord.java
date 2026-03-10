package marsops.automation.domain;

import java.util.Date;
import java.util.UUID;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class FiringRecord {
    private final UUID id;
    private final UUID ruleId;
    private final Date firedAt;
    private final String groupId;
    private final String metricId;
    private final Object metricValue;
    private final String metricUnit;
    private final String actuatorId;
    private final boolean actuatorState;

    public FiringRecord(Rule rule, Object metricValue, String metricUnit) {
        this(UUID.randomUUID(), rule.getId(), new Date(), rule.getGroupId(), rule.getMetricId(), metricValue,
                metricUnit,
                rule.getActuatorId(), rule.isActuatorState());
    }
}
