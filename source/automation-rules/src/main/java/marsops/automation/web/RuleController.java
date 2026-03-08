package marsops.automation.web;

import marsops.automation.domain.Operator;
import marsops.automation.domain.Rule;
import marsops.automation.domain.TargetState;
import marsops.automation.repo.RuleRepository;
import marsops.automation.web.dto.CreateRuleRequest;
import marsops.automation.web.dto.SetEnabledRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rules")
public class RuleController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RuleController.class);

    private final RuleRepository ruleRepository;

    public RuleController(RuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    @GetMapping
    public List<Rule> listRules() {
        List<Rule> rules = ruleRepository.findAll();
        LOGGER.info("[AUTOMATION-AUDIT] listRules size={}", rules.size());
        return rules;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Rule createRule(@Valid @RequestBody CreateRuleRequest request) {
        validateDomain(request);
        Rule createdRule = ruleRepository.create(
            Boolean.TRUE.equals(request.getEnabled()),
            request.getSensorName(),
            request.getOperator(),
            request.getThresholdValue(),
            request.getUnit(),
            request.getActuatorName(),
            request.getTargetState().toUpperCase()
        );
        LOGGER.info("[AUTOMATION-AUDIT] createRule id={} sensor={} operator={} threshold={} actuator={} targetState={} enabled={}",
            createdRule.getId(),
            createdRule.getSensorName(),
            createdRule.getOperator(),
            createdRule.getThresholdValue(),
            createdRule.getActuatorName(),
            createdRule.getTargetState(),
            createdRule.isEnabled());
        return createdRule;
    }

    @PutMapping("/{id}")
    public Rule updateRule(@PathVariable("id") String id, @Valid @RequestBody CreateRuleRequest request) {
        validateDomain(request);
        Rule updatedRule = ruleRepository.update(
                id,
                Boolean.TRUE.equals(request.getEnabled()),
                request.getSensorName(),
                request.getOperator(),
                request.getThresholdValue(),
                request.getUnit(),
                request.getActuatorName(),
                request.getTargetState().toUpperCase()
            )
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found"));
        LOGGER.info("[AUTOMATION-AUDIT] updateRule id={} sensor={} operator={} threshold={} actuator={} targetState={} enabled={}",
            updatedRule.getId(),
            updatedRule.getSensorName(),
            updatedRule.getOperator(),
            updatedRule.getThresholdValue(),
            updatedRule.getActuatorName(),
            updatedRule.getTargetState(),
            updatedRule.isEnabled());
        return updatedRule;
    }

    @PatchMapping("/{id}/enabled")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setEnabled(@PathVariable("id") String id, @Valid @RequestBody SetEnabledRequest request) {
        ruleRepository.setEnabled(id, request.getEnabled())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found"));
        LOGGER.info("[AUTOMATION-AUDIT] setEnabled id={} enabled={}", id, request.getEnabled());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRule(@PathVariable("id") String id) {
        if (!ruleRepository.deleteById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule not found");
        }
        LOGGER.info("[AUTOMATION-AUDIT] deleteRule id={}", id);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationError() {
        LOGGER.warn("[AUTOMATION-AUDIT] validationError invalid request payload");
        return Map.of("error", "Invalid request payload");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleIllegalArgument(IllegalArgumentException exception) {
        LOGGER.warn("[AUTOMATION-AUDIT] domainValidationError message={}", exception.getMessage());
        return Map.of("error", exception.getMessage());
    }

    private void validateDomain(CreateRuleRequest request) {
        Operator.fromSymbol(request.getOperator());
        TargetState.from(request.getTargetState());
    }
}
