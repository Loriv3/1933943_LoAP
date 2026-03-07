package marsops.automation.web;

import jakarta.jms.Connection;
import jakarta.jms.ConnectionFactory;
import jakarta.jms.JMSException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    private final ConnectionFactory connectionFactory;

    public HealthController(ConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @GetMapping({"/health", "/api/health"})
    public Map<String, Object> health() {
        boolean brokerConnected = isBrokerConnected();
        return Map.of(
            "status", brokerConnected ? "ok" : "degraded",
            "brokerConnected", brokerConnected
        );
    }

    private boolean isBrokerConnected() {
        try (Connection connection = connectionFactory.createConnection()) {
            return true;
        } catch (JMSException exception) {
            return false;
        }
    }
}
