package marsops.automation.repo;

import marsops.automation.domain.FiringRecord;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Repository
public class FiringRepository {

    private final JdbcTemplate jdbcTemplate;

    private final Date dateFromString(String s) {
        var dateTime = ZonedDateTime.parse(s, DateTimeFormatter.ISO_DATE_TIME);
        return Date.from(dateTime.toInstant());
    }

    public FiringRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(FiringRecord record) {
        jdbcTemplate.update(
                """
                        INSERT INTO rule_firings (id, rule_id, fired_at, group_id, metric_id, metric_value_str, metric_value_double, metric_unit, actuator_id, actuator_state)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                record.getId().toString(),
                record.getRuleId().toString(),
                record.getFiredAt(),
                record.getGroupId(),
                record.getMetricId(),
                record.getMetricValue() instanceof String s ? s : null,
                record.getMetricValue() instanceof Number n ? n.doubleValue() : null,
                record.getMetricUnit(),
                record.getActuatorId(),
                record.isActuatorState());
    }

    public List<FiringRecord> listRecent(int limit) {
        return jdbcTemplate.query(
                """
                        SELECT id, rule_id, fired_at, group_id, metric_id, metric_value_str, metric_value_double, actuator_id, actuator_state
                        FROM rule_firings
                        ORDER BY fired_at DESC
                        LIMIT ?
                        """,
                (rs, rowNum) -> {
                    String metricValueStr = rs.getString("metric_value_str");
                    Double metricValueDouble = rs.getDouble("metric_value_double");
                    return new FiringRecord(
                            UUID.fromString(rs.getString("id")),
                            UUID.fromString(rs.getString("rule_id")),
                            dateFromString(rs.getString("fired_at")),
                            rs.getString("group_id"),
                            rs.getString("metric_id"),
                            metricValueStr == null ? metricValueDouble : metricValueStr,
                            rs.getString("metric_unit"),
                            rs.getString("actuator_id"),
                            rs.getBoolean("actuator_state"));
                },
                limit);
    }
}
