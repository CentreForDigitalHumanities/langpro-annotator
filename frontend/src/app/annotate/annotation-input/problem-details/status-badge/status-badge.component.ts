import { statusLabels } from '@/shared/displayTextMappings';
import { ProblemStatus } from '@/types';
import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMedal } from '@fortawesome/free-solid-svg-icons';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'la-status-badge',
    imports: [FontAwesomeModule, NgbTooltipModule],
    templateUrl: './status-badge.component.html',
    styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
    public readonly status = input.required<ProblemStatus>();
    public statusLabels = statusLabels;
    public faMedal = faMedal;
    public ProblemStatus = ProblemStatus;
}
