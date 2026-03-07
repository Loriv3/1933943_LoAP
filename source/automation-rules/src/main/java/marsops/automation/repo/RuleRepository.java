package marsops.automation.repo;

import marsops.automation.domain.Rule;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class RuleRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Rule> ruleRowMapper = (rs, rowNum) -> new Rule(
        rs.getString("id"),
        rs.getInt("enabled") == 1,
        rs.getString("sensor_name"),
        rs.getString("operator"),
        rs.getDouble("threshold_value"),
        rs.getString("unit"),
        rs.getString("actuator_name"),
        rs.getString("target_state"),
        rs.getString("created_at"),
        rs.getString("updated_at")
    );

    public RuleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Rule> findAll() {
        return jdbcTemplate.query("SELECT * FROM rules ORDER BY created_at DESC", ruleRowMapper);
    }

    public Optional<Rule> findById(String id) {
        List<Rule> rows = jdbcTemplate.query("SELECT * FROM rules WHERE id = ?", ruleRowMapper, id);
        return rows.stream().findFirst();
    }

    public List<Rule> findEnabledBySensorName(String sensorName) {
        return jdbcTemplate.query(
            "SELECT * FROM rules WHERE sensor_name = ? AND enabled = 1",
            ruleRowMapper,
            sensorName
        );
    }

    public Rule create(boolean enabled,
                       String sensorName,
                       String operator,
                       double thresholdValue,
                       String unit,
                       String actuatorName,
                       String targetState) {
        String now = Instant.now().toString();
        String id = UUID.randomUUID().toString();
        jdbcTemplate.update(
            """
                INSERT INTO rules (id, enabled, sensor_name, operator, threshold_value, unit, actuator_name, target_state, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
            id,
            enabled ? 1 : 0,
            sensorName,
            operator,
            thresholdValue,
            unit,
            actuatorName,
            targetState,
            now,
            now
        );
        return findById(id).orElseThrow();
    }

    public Optional<Rule> update(String id,
                                 boolean enabled,
                                 String sensorName,
                                 String operator,
                                 double thresholdValue,
                                 String unit,
                                 String actuatorName,
                                 String targetState) {
        Optional<Rule> existing = findById(id);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        String now = Instant.now().toString();
        jdbcTemplate.update(
            """
                UPDATE rules
                SET enabled = ?, sensor_name = ?, operator = ?, threshold_value = ?, unit = ?, actuator_name = ?, target_state = ?, updated_at = ?
                WHERE id = ?
                """,
            enabled ? 1 : 0,
            sensorName,
            operator,
            thresholdValue,
            unit,
            actuatorName,
            targetState,
            now,
            id
        );
        return findById(id);
    }

    public Optional<Rule> setEnabled(String id, boolean enabled) {
        int updated = jdbcTemplate.update(
            "UPDATE rules SET enabled = ?, updated_at = ? WHERE id = ?",
            enabled ? 1 : 0,
            Instant.now().toString(),
            id
        );
        if (updated == 0) {
            return Optional.empty();
        }
        return findById(id);
    }

    public boolean deleteById(String id) {
        return jdbcTemplate.update("DELETE FROM rules WHERE id = ?", id) > 0;
    }
}
