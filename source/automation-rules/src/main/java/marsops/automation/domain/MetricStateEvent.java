package marsops.automation.domain;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class MetricStateEvent {
    private String id;
    private String type;
    private List<MetricStateEventValue> value;
}
