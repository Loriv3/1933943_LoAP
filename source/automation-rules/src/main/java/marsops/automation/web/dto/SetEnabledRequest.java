package marsops.automation.web.dto;

import jakarta.validation.constraints.NotNull;

public class SetEnabledRequest {

    @NotNull
    private Boolean enabled;

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
