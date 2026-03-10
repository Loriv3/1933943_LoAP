package marsops.automation.service;

import marsops.automation.domain.ActuatorCommand;
import marsops.automation.domain.FiringRecord;
import marsops.automation.domain.Rule;
import marsops.automation.domain.MetricGroupStateEvent;
import marsops.automation.repo.FiringRepository;
import marsops.automation.repo.RuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RuleEngineService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RuleEngineService.class);

    private final RuleRepository ruleRepository;
    private final FiringRepository firingRepository;
    private final JmsTemplate jmsTemplate;
    private final @NonNull String queueCommands;

    private final Map<String, Boolean> actuatorStateCache = new ConcurrentHashMap<>();

    public RuleEngineService(RuleRepository ruleRepository,
            FiringRepository firingRepository,
            JmsTemplate jmsTemplate,
            @Value("${app.jms.queueCommands}") @NonNull String queueCommands) {
        this.ruleRepository = ruleRepository;
        this.firingRepository = firingRepository;
        this.jmsTemplate = jmsTemplate;
        this.queueCommands = queueCommands;
    }

    public void processStateEvent(MetricGroupStateEvent event) {

        LOGGER.info("Processing metric group state event: {}", event);

        int firedCommands = 0;

        for (var metric : event.getMetrics()) {
            List<Rule> rules = ruleRepository.findEnabledByMetric(event.getGroupId(), metric.getId());
            LOGGER.info("Found {} rule/s: {}", rules.size(), rules);
            for (var rule : rules) {
                Boolean wasOn = actuatorStateCache.get(rule.getActuatorId());
                boolean willBeOn = rule.isActuatorState();
                if (((Boolean) willBeOn).equals(wasOn)) {
                    LOGGER.info("Skipping unnecessary rule for actuator={} state={}", rule.getActuatorId(),
                            willBeOn);
                    continue;
                }

                for (var value : metric.getValue()) {
                    // Check for a match in both unit and value type
                    if (!value.getUnit().equals(rule.getUnit())) {
                        continue;
                    }
                    if (value.getValue() instanceof String value_
                            && rule.getCompareValue() instanceof String compareValue_) {
                        if (!rule.getOperator().evaluateString(value_, compareValue_)) {
                            continue;
                        }
                    } else if (value.getValue() instanceof Double value_
                            && rule.getCompareValue() instanceof Double compareValue_) {
                        if (!rule.getOperator().evaluateDouble(value_, compareValue_)) {
                            continue;
                        }
                    } else {
                        continue;
                    }

                    // The rule should run
                    LOGGER.info("Rule conditions satisfied: {}", rule);

                    ActuatorCommand command = new ActuatorCommand(
                            new Date(),
                            rule.getActuatorId(),
                            willBeOn,
                            rule.getId(),
                            new ActuatorCommand.Reason(rule.getGroupId(), rule.getMetricId(), value.getValue(),
                                    value.getUnit(), rule.getOperator(), rule.getCompareValue()));

                    jmsTemplate.convertAndSend(queueCommands, command);
                    firingRepository.save(new FiringRecord(rule, value.getValue(), value.getUnit()));
                    firedCommands++;
                    LOGGER.info("Command sent to queue={} actuator={} state={} ruleId={}",
                            queueCommands,
                            rule.getActuatorId(),
                            willBeOn,
                            rule.getId());
                }
            }
            LOGGER.info("Processed metric {}", metric);
        }

        LOGGER.info("Processed metric group state event with {} firings: {}", firedCommands, event);
    }

    public void applyActuatorStateUpdate(String actuatorId, boolean isOn) {
        actuatorStateCache.put(actuatorId, isOn);
        LOGGER.info("Actuator state update consumed actuator={} state={}", actuatorId,
                isOn);
    }
}
