package marsops.automation.web;

import marsops.automation.domain.FiringRecord;
import marsops.automation.repo.FiringRepository;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rule-firings")
@CrossOrigin
public class RuleFiringController {

    private final FiringRepository firingRepository;

    public RuleFiringController(FiringRepository firingRepository) {
        this.firingRepository = firingRepository;
    }

    @GetMapping
    public List<FiringRecord> listRuleFirings(@RequestParam(name = "limit", defaultValue = "50") int limit) {
        int normalizedLimit = Math.max(1, Math.min(limit, 500));
        return firingRepository.listRecent(normalizedLimit);
    }
}
