package marsops.automation.web;

import marsops.automation.domain.Rule;
import marsops.automation.repo.RuleRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
public class MetricMappingController {

    private final RuleRepository ruleRepository;

    public MetricMappingController(RuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    @GetMapping("/mapping")
    public Map<String, Object> mapping() {
        Map<String, Map<String, String>> grouped = new LinkedHashMap<>();
        for (Rule rule : ruleRepository.findAll()) {
            String sensorName = rule.getSensorName();
            if (sensorName == null || !sensorName.contains(".")) {
                continue;
            }

            String[] parts = sensorName.split("\\.", 2);
            String groupId = parts[0];
            String metricId = parts[1];

            grouped.computeIfAbsent(groupId, ignored -> new LinkedHashMap<>())
                .putIfAbsent(metricId, toDisplayName(metricId));
        }

        List<Map<String, Object>> groups = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> groupEntry : grouped.entrySet()) {
            List<Map<String, String>> metrics = new ArrayList<>();
            for (Map.Entry<String, String> metricEntry : groupEntry.getValue().entrySet()) {
                metrics.add(Map.of(
                    "metric_id", metricEntry.getKey(),
                    "display_name", metricEntry.getValue()
                ));
            }

            groups.add(Map.of(
                "group_id", groupEntry.getKey(),
                "metrics", metrics
            ));
        }

        return Map.of("groups", groups);
    }

    private String toDisplayName(String metricId) {
        String spaced = metricId.replace('_', ' ').replace('.', ' ').trim();
        if (spaced.isEmpty()) {
            return metricId;
        }
        return spaced.substring(0, 1).toUpperCase(Locale.ROOT) + spaced.substring(1);
    }
}
