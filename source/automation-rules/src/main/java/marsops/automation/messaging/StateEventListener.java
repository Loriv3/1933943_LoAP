package marsops.automation.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import marsops.automation.domain.StateEvent;
import marsops.automation.service.RuleEngineService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class StateEventListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(StateEventListener.class);

    private final RuleEngineService ruleEngineService;
    private final ObjectMapper objectMapper;

    public StateEventListener(RuleEngineService ruleEngineService, ObjectMapper objectMapper) {
        this.ruleEngineService = ruleEngineService;
        this.objectMapper = objectMapper;
    }

    @JmsListener(destination = "${app.jms.topicState}", containerFactory = "topicListenerFactory")
    public void onStateEventTopic(String payload) {
        handleStateEvent(payload);
    }

    @JmsListener(destination = "${app.jms.topicState}", containerFactory = "queueListenerFactory")
    public void onStateEventQueue(String payload) {
        handleStateEvent(payload);
    }

    private void handleStateEvent(String payload) {
        if (payload == null || payload.isBlank()) {
            LOGGER.debug("Ignoring empty StateEvent payload");
            return;
        }

        String trimmedPayload = payload.trim();
        LOGGER.info("StateEvent payload received size={} chars", trimmedPayload.length());
        if (!trimmedPayload.startsWith("{")) {
            LOGGER.debug("Ignoring non-JSON StateEvent payload: {}", abbreviate(trimmedPayload));
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(trimmedPayload);
            if (!root.isObject()) {
                LOGGER.debug("Ignoring JSON payload that is not an object: {}", abbreviate(trimmedPayload));
                return;
            }

            if (root.has("group_id") && root.has("metrics") && root.get("metrics").isArray()) {
                processGroupedMetricsEvent(root);
                return;
            }

            StateEvent stateEvent = objectMapper.treeToValue(root, StateEvent.class);
            ruleEngineService.processStateEvent(stateEvent);
        } catch (JsonProcessingException exception) {
            LOGGER.warn("Ignoring malformed StateEvent payload: {}", abbreviate(trimmedPayload));
        }
    }

    private void processGroupedMetricsEvent(JsonNode root) {
        String groupId = asText(root.get("group_id"));
        String updatedAt = firstNonBlank(asText(root.get("updated_at")), asText(root.get("at")));
        String status = asText(root.get("status"));
        JsonNode metrics = root.get("metrics");
        int generatedEvents = 0;

        for (JsonNode metric : metrics) {
            String metricId = firstNonBlank(asText(metric.get("metric_id")), asText(metric.get("id")));
            if (groupId == null || metricId == null) {
                continue;
            }

            JsonNode values = metric.get("value");
            if (values == null || !values.isArray()) {
                continue;
            }

            for (JsonNode valueNode : values) {
                JsonNode numericValueNode = valueNode.get("value");
                if (numericValueNode == null || !numericValueNode.isNumber()) {
                    continue;
                }

                StateEvent event = new StateEvent();
                event.setEventTime(updatedAt);
                event.setKind("sensor");
                event.setSensorName(groupId + "." + metricId);
                event.setValue(numericValueNode.doubleValue());
                event.setUnit(asText(valueNode.get("unit")));
                event.setStatus(status);
                ruleEngineService.processStateEvent(event);
                generatedEvents++;
            }
        }

        LOGGER.info("Grouped StateEvent consumed groupId={} generatedEvents={}", groupId, generatedEvents);
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }

    private String asText(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return node.asText();
    }

    private String abbreviate(String payload) {
        int maxLen = 160;
        if (payload.length() <= maxLen) {
            return payload;
        }
        return payload.substring(0, maxLen) + "...";
    }
}
