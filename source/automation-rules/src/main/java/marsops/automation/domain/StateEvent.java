package marsops.automation.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StateEvent {

    private String eventTime;
    private String kind;
    private String sensorName;
    private Double value;
    private String unit;
    private String status;

    @JsonProperty("event_time")
    public String getEventTime() {
        return eventTime;
    }

    @JsonProperty("event_time")
    public void setEventTime(String eventTime) {
        this.eventTime = eventTime;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    @JsonProperty("sensor_name")
    public String getSensorName() {
        return sensorName;
    }

    @JsonProperty("sensor_name")
    public void setSensorName(String sensorName) {
        this.sensorName = sensorName;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
