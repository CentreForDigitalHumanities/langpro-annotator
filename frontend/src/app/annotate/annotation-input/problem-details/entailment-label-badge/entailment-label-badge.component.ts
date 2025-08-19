import { Component, computed, input } from "@angular/core";
import { EntailmentLabel } from "../../../../types";
import { entailmentLabels } from "@/shared/displayTextMappings";

@Component({
    selector: "la-entailment-label-badge",
    standalone: true,
    imports: [],
    templateUrl: "./entailment-label-badge.component.html",
    styleUrl: "./entailment-label-badge.component.scss",
})
export class EntailmentLabelBadgeComponent {
    public entailmentLabel = input.required<EntailmentLabel>();

    public entailmentText = computed<string>(() => {
        const entailment = this.entailmentLabel();
        return entailmentLabels[entailment];
    });

    public entailmentClass = computed<string>(() => {
        const entailment = this.entailmentLabel();
        switch (entailment) {
            case EntailmentLabel.ENTAILMENT:
                return "badge text-bg-success";
            case EntailmentLabel.CONTRADICTION:
                return "badge text-bg-danger";
            case EntailmentLabel.NEUTRAL:
                return "badge text-bg-secondary";
            case EntailmentLabel.UNKNOWN:
                return "badge text-bg-warning";
        }
    });
}
