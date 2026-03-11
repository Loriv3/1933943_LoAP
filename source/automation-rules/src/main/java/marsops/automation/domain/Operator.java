package marsops.automation.domain;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Operator {
    LT("lt"),
    LE("le"),
    EQ("eq"),
    GT("gt"),
    GE("ge");

    private final String value;

    Operator(String value) {
        this.value = value;
    }

    @JsonCreator
    public static Operator forValue(String value) {
        return Arrays.stream(values())
            .filter(enumValue -> enumValue.value.equals(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown Operator: " + value));
    }

    @JsonValue
    public String toValue() {
        return this.value;
    }

    public boolean evaluateNumber(Number left, Number right) {
        double left_ = left.doubleValue();
        double right_ = right.doubleValue();
        return switch (this) {
            case LT -> left_ < right_;
            case LE -> left_ <= right_;
            case EQ -> Double.compare(left_, right_) == 0;
            case GT -> left_ > right_;
            case GE -> left_ >= right_;
        };
    }

    public boolean evaluateString(String left, String right) {
        var comparison = left.compareTo(right);
        return switch (this) {
            case LT -> comparison < 0;
            case LE -> comparison <= 0;
            case EQ -> comparison == 0;
            case GT -> comparison >= 0;
            case GE -> comparison > 0;
        };
    }
}
