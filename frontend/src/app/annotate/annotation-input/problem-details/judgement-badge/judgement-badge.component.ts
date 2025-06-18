import { Component, computed, input } from "@angular/core";
import { Judgement } from "../../../../types";

@Component({
    selector: "la-judgement-badge",
    standalone: true,
    imports: [],
    templateUrl: "./judgement-badge.component.html",
    styleUrl: "./judgement-badge.component.scss",
})
export class JudgementBadgeComponent {
    public judgement = input.required<Judgement>();

    public judgementText = computed<string>(() => {
        const judgement = this.judgement();
        switch (judgement) {
            case Judgement.ENTAILMENT:
                return "Entailment";
            case Judgement.CONTRADICTION:
                return "Contradiction";
            case Judgement.NEUTRAL:
                return "Neutral";
            case Judgement.UNKNOWN:
                return "Unknown";
        }
    });

    public judgementClass = computed<string>(() => {
        const judgement = this.judgement();
        switch (judgement) {
            case Judgement.ENTAILMENT:
                return "badge text-bg-success";
            case Judgement.CONTRADICTION:
                return "badge text-bg-danger";
            case Judgement.NEUTRAL:
                return "badge text-bg-secondary";
            case Judgement.UNKNOWN:
                return "badge text-bg-warning";
        }
    });
}
