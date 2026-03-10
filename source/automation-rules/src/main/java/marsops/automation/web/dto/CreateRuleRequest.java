package marsops.automation.web.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import marsops.automation.domain.Operator;

@Data
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateRuleRequest {
    private boolean enabled = true;

    @NotBlank
    private String groupId;
    @NotBlank
    private String metricId;
    @NotNull
    private Operator operator;
    @NotNull
    private Object compareValue;
    @NotNull
    private String unit;
    @NotBlank
    private String actuatorId;
    @NotNull
    private boolean actuatorState;
}
