package marsops.automation.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import marsops.automation.domain.TargetState;
import marsops.automation.service.RuleEngineService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class ActuatorStateListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(ActuatorStateListener.class);

    private final RuleEngineService ruleEngineService;
    private final ObjectMapper objectMapper;
    private final String actuatorStatesQueue;

    public ActuatorStateListener(RuleEngineService ruleEngineService,
                                 ObjectMapper objectMapper,
                                 @Value("${app.jms.queueActuatorStates}") String actuatorStatesQueue) {
        this.ruleEngineService = ruleEngineService;
        this.objectMapper = objectMapper;
        this.actuatorStatesQueue = actuatorStatesQueue;
    }

    @JmsListener(destination = "${app.jms.queueActuatorStates}", containerFactory = "queueListenerFactory")
    public void onActuatorState(String payload) {
        handle(payload, actuatorStatesQueue);
    }

    private void handle(String payload, String sourceQueue) {
        if (payload == null || payload.isBlank()) {
            LOGGER.debug("Ignoring empty actuator-state payload from {}", sourceQueue);
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String actuatorName = firstNonBlank(asText(root.get("actuator_id")), asText(root.get("actuator_name")));

            TargetState targetState = parseTargetState(root);
            if (targetState == null) {
                LOGGER.debug("Ignoring actuator-state payload without state field source={} payload={}", sourceQueue, abbreviate(payload));
                return;
            }

            ruleEngineService.applyActuatorStateUpdate(actuatorName, targetState, sourceQueue);
        } catch (Exception exception) {
            LOGGER.debug("Ignoring non actuator-state payload from {}", sourceQueue);
        }
    }

    private TargetState parseTargetState(JsonNode root) {
        JsonNode isOnNode = root.get("is_on");
        if (isOnNode != null && isOnNode.isBoolean()) {
            return isOnNode.asBoolean() ? TargetState.ON : TargetState.OFF;
        }

        String state = asText(root.get("state"));
        if (state == null || state.isBlank()) {
            return null;
        }

        try {
            return TargetState.from(state);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private String asText(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return node.asText();
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }

    private String abbreviate(String payload) {
        int maxLen = 160;
        if (payload.length() <= maxLen) {
            return payload;
        }
        return payload.substring(0, maxLen) + "...";
    }
}
