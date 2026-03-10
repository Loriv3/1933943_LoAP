package marsops.automation.domain;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum GroupStatus {
    Ok("ok"),
    Warning("warning");

    private final String value;

    GroupStatus(String value) {
        this.value = value;
    }

    @JsonCreator
    public static GroupStatus forValue(String value) {
        return Arrays.stream(values())
            .filter(enumValue -> enumValue.value.equals(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown GroupStatus: " + value));
    }

    @JsonValue
    public String toValue() {
        return this.value;
    }
}
