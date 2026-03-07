package marsops.automation.domain;

import java.util.Arrays;

public enum Operator {
    LT("<"),
    LTE("<="),
    EQ("="),
    GT(">"),
    GTE(">=");

    private final String symbol;

    Operator(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() {
        return symbol;
    }

    public boolean evaluate(double left, double right) {
        return switch (this) {
            case LT -> left < right;
            case LTE -> left <= right;
            case EQ -> Double.compare(left, right) == 0;
            case GT -> left > right;
            case GTE -> left >= right;
        };
    }

    public static Operator fromSymbol(String symbol) {
        return Arrays.stream(values())
            .filter(operator -> operator.symbol.equals(symbol))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unsupported operator: " + symbol));
    }
}
