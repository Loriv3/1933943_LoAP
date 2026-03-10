package marsops.automation.domain;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.annotation.Nullable;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class MetricGroupStateEvent {
    private Date at;
    private String groupId;
    private List<MetricStateEvent> metrics;
    private @Nullable GroupStatus status;
}
