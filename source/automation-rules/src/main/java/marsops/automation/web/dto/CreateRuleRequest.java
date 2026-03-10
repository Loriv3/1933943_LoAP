package marsops.automation.web.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import marsops.automation.domain.Operator;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateRuleRequest {
    private final boolean enabled = true;

    @NotBlank
    private final String groupId;
    @NotBlank
    private final String metricId;
    @NotBlank
    private final Operator operator;
    @NotNull
    private final Object compareValue;
    @NotNull
    private final String unit;
    @NotBlank
    private final String actuatorId;
    @NotNull
    private final boolean actuatorState;
}
