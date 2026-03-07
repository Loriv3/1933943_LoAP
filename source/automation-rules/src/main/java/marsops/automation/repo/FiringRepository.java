package marsops.automation.repo;

import marsops.automation.domain.FiringRecord;
import marsops.automation.domain.Rule;
import marsops.automation.domain.StateEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public class FiringRepository {

    private final JdbcTemplate jdbcTemplate;

    public FiringRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(Rule rule, StateEvent event) {
        jdbcTemplate.update(
            """
                INSERT INTO rule_firings (id, rule_id, fired_at, sensor_name, sensor_value, actuator_name, target_state)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
            UUID.randomUUID().toString(),
            rule.getId(),
            Instant.now().toString(),
            event.getSensorName(),
            event.getValue(),
            rule.getActuatorName(),
            rule.getTargetState()
        );
    }

    public List<FiringRecord> listRecent(int limit) {
        return jdbcTemplate.query(
            """
                SELECT id, rule_id, fired_at, sensor_name, sensor_value, actuator_name, target_state
                FROM rule_firings
                ORDER BY fired_at DESC
                LIMIT ?
                """,
            (rs, rowNum) -> new FiringRecord(
                rs.getString("id"),
                rs.getString("rule_id"),
                rs.getString("fired_at"),
                rs.getString("sensor_name"),
                rs.getDouble("sensor_value"),
                rs.getString("actuator_name"),
                rs.getString("target_state")
            ),
            limit
        );
    }
}
