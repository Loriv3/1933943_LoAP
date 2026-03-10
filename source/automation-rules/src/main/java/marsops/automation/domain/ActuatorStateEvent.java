package marsops.automation.domain;

import java.util.Date;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ActuatorStateEvent {
    private Date updatedAt;
    private String actuatorId;
    private boolean isOn;
}
