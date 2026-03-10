package marsops.automation.repo;

import marsops.automation.domain.Operator;
import marsops.automation.domain.Rule;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class RuleRepository {
    private final JdbcTemplate jdbcTemplate;

    private final Date dateFromString(String s) {
        var dateTime = ZonedDateTime.parse(s, DateTimeFormatter.ISO_DATE_TIME);
        return Date.from(dateTime.toInstant());
    }

    private final @NonNull RowMapper<Rule> ruleRowMapper = (rs, rowNum) -> {
        String compareValueStr = rs.getString("compare_value_str");
        Double compareValueDouble = rs.getDouble("compare_value_double");
        return new Rule(
                UUID.fromString(rs.getString("id")),
                rs.getBoolean("enabled"),
                dateFromString(rs.getString(("created_at"))),
                dateFromString(rs.getString(("updated_at"))),
                rs.getString("group_id"),
                rs.getString("metric_id"),
                Operator.forValue(rs.getString("operator")),
                compareValueStr == null ? compareValueDouble : compareValueStr,
                rs.getString("unit"),
                rs.getString("actuator_id"),
                rs.getBoolean("actuator_state"));
    };

    public RuleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Rule> findAll() {
        return jdbcTemplate.query("SELECT * FROM rules ORDER BY created_at DESC", ruleRowMapper);
    }

    public Optional<Rule> findById(UUID id) {
        List<Rule> rows = jdbcTemplate.query("SELECT * FROM rules WHERE id = ?", ruleRowMapper, id.toString());
        return rows.stream().findFirst();
    }

    public List<Rule> findEnabledByMetric(String groupId, String metricId) {
        return jdbcTemplate.query(
                "SELECT * FROM rules WHERE group_id = ? AND metric_id = ? AND enabled = 1",
                ruleRowMapper,
                groupId,
                metricId);
    }

    public Rule create(boolean enabled,
            String groupId,
            String metricId,
            Operator operator,
            Object compareValue,
            String unit,
            String actuatorId,
            boolean actuatorState) {
        UUID id = UUID.randomUUID();
        String now = Instant.now().toString();
        jdbcTemplate.update(
                """
                        INSERT INTO rules (id, enabled, created_at, updated_at, group_id, metric_id, operator, compare_value_str, compare_value_double, unit, actuator_id, actuator_state)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                id.toString(),
                enabled,
                now,
                now,
                groupId,
                metricId,
                operator.toValue(),
                compareValue instanceof String s ? s : null,
                compareValue instanceof Double d ? d : null,
                unit,
                actuatorId,
                actuatorState);
        return findById(id).orElseThrow();
    }

    public Optional<Rule> update(UUID id,
            boolean enabled,
            String groupId,
            String metricId,
            Operator operator,
            Object compareValue,
            String unit,
            String actuatorId,
            boolean actuatorState) {
        Optional<Rule> existing = findById(id);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        String now = Instant.now().toString();
        jdbcTemplate.update(
                """
                        UPDATE rules
                        SET enabled = ?, updated_at = ?, group_id = ?, metric_id = ?, operator = ?, compare_value_str = ?, compare_value_double = ?, unit = ?, actuator_id = ?, actuator_state = ?
                        WHERE id = ?
                        """,
                enabled,
                now,
                groupId,
                metricId,
                operator.toValue(),
                compareValue instanceof String s ? s : null,
                compareValue instanceof Double d ? d : null,
                unit,
                actuatorId,
                actuatorState,
                id.toString());
        return findById(id);
    }

    public Optional<Rule> setEnabled(UUID id, boolean enabled) {
        int updated = jdbcTemplate.update(
                "UPDATE rules SET enabled = ?, updated_at = ? WHERE id = ?",
                enabled,
                new Date(),
                id.toString());
        if (updated == 0) {
            return Optional.empty();
        }
        return findById(id);
    }

    public boolean deleteById(UUID id) {
        return jdbcTemplate.update("DELETE FROM rules WHERE id = ?", id.toString()) > 0;
    }
}
