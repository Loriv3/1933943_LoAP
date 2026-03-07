package marsops.automation.service;

import marsops.automation.domain.ActuatorCommand;
import marsops.automation.domain.Operator;
import marsops.automation.domain.Rule;
import marsops.automation.domain.StateEvent;
import marsops.automation.domain.TargetState;
import marsops.automation.repo.FiringRepository;
import marsops.automation.repo.RuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RuleEngineService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RuleEngineService.class);

    private final RuleRepository ruleRepository;
    private final FiringRepository firingRepository;
    private final JmsTemplate jmsTemplate;
    private final String queueCommands;

    private final Map<String, TargetState> actuatorStateCache = new ConcurrentHashMap<>();

    public RuleEngineService(RuleRepository ruleRepository,
                             FiringRepository firingRepository,
                             JmsTemplate jmsTemplate,
                             @Value("${app.jms.queueCommands}") String queueCommands) {
        this.ruleRepository = ruleRepository;
        this.firingRepository = firingRepository;
        this.jmsTemplate = jmsTemplate;
        this.queueCommands = queueCommands;
    }

    public void processStateEvent(StateEvent event) {
        if (!isValidForRuleEngine(event)) {
            return;
        }

        List<Rule> rules = ruleRepository.findEnabledBySensorName(event.getSensorName());
        for (Rule rule : rules) {
            if (!isUnitCompatible(rule, event)) {
                continue;
            }

            Operator operator = Operator.fromSymbol(rule.getOperator());
            if (!operator.evaluate(event.getValue(), rule.getThresholdValue())) {
                continue;
            }

            TargetState targetState = TargetState.from(rule.getTargetState());
            TargetState previousState = actuatorStateCache.get(rule.getActuatorName());
            if (previousState == targetState) {
                LOGGER.debug("Skipping duplicate command for actuator={} state={}", rule.getActuatorName(), targetState);
                continue;
            }

            ActuatorCommand command = new ActuatorCommand(
                Instant.now().toString(),
                rule.getActuatorName(),
                targetState.name(),
                rule.getId(),
                new ActuatorCommand.Reason(
                    event.getSensorName(),
                    event.getValue(),
                    rule.getOperator(),
                    rule.getThresholdValue()
                )
            );

            jmsTemplate.convertAndSend(queueCommands, command);
            actuatorStateCache.put(rule.getActuatorName(), targetState);
            firingRepository.save(rule, event);
            LOGGER.info("Command sent to queue={} actuator={} state={} ruleId={}",
                queueCommands,
                rule.getActuatorName(),
                targetState,
                rule.getId());
        }
    }

    private boolean isValidForRuleEngine(StateEvent event) {
        if (event == null || event.getSensorName() == null || event.getSensorName().isBlank() || event.getValue() == null) {
            return false;
        }
        return event.getKind() == null || "sensor".equalsIgnoreCase(event.getKind());
    }

    private boolean isUnitCompatible(Rule rule, StateEvent event) {
        if (rule.getUnit() == null || rule.getUnit().isBlank()) {
            return true;
        }
        return event.getUnit() != null && rule.getUnit().equalsIgnoreCase(event.getUnit());
    }
}
