package marsops.automation.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import marsops.automation.domain.MetricGroupStateEvent;
import marsops.automation.service.RuleEngineService;

import java.nio.charset.Charset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MetricEventListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(MetricEventListener.class);

    private final RuleEngineService ruleEngineService;
    private final ObjectMapper objectMapper;

    public MetricEventListener(RuleEngineService ruleEngineService, ObjectMapper objectMapper) {
        this.ruleEngineService = ruleEngineService;
        this.objectMapper = objectMapper;
    }

    @JmsListener(destination = "${app.jms.topicMetricEvents}", containerFactory = "topicListenerFactory")
    public void onEventTopic(byte[] payload) {
        handleEvent(payload);
    }

    @JmsListener(destination = "${app.jms.topicMetricEvents}", containerFactory = "queueListenerFactory")
    public void onEventQueue(byte[] payload) {
        handleEvent(payload);
    }

    private void handleEvent(byte[] payload) {
        if (payload == null || payload.length == 0) {
            LOGGER.debug("Ignoring empty MetricGroupStateEvent payload");
            return;
        }

        LOGGER.info("MetricGroupStateEvent payload received size={}", payload.length);

        try {
            MetricGroupStateEvent event = objectMapper.readValue(payload, MetricGroupStateEvent.class);
            ruleEngineService.processStateEvent(event);
        } catch (Exception exception) {
            LOGGER.warn("Malformed ActuatorStateEvent payload: {}, exception: {}",
                    abbreviate(new String(payload, Charset.forName("UTF-8"))), exception);
        }
    }

    private String abbreviate(String payload) {
        int maxLen = 160;
        if (payload.length() <= maxLen) {
            return payload;
        }
        return payload.substring(0, maxLen) + "...";
    }
}
