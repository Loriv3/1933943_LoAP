package marsops.automation.domain;

public enum TargetState {
    ON,
    OFF;

    public static TargetState from(String value) {
        return TargetState.valueOf(value.trim().toUpperCase());
    }
}
