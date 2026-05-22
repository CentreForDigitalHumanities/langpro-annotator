import { StatusBadgeComponent } from '@/annotate/annotation-input/problem-details/status-badge/status-badge.component';
import { ProblemStatus } from '@/types';
import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'la-status-info-modal',
    imports: [StatusBadgeComponent],
    templateUrl: './status-info-modal.component.html',
    styleUrl: './status-info-modal.component.scss'
})
export class StatusInfoModalComponent {
    public activeModal = inject(NgbActiveModal);

    public ProblemStatus = ProblemStatus;
}
