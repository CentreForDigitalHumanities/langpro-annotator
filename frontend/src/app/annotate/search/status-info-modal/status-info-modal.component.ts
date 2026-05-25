import { StatusBadgeComponent } from '@/annotate/annotation-input/problem-details/status-badge/status-badge.component';
import { AuthService } from '@/services/auth.service';
import { ProblemStatus } from '@/types';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs';

@Component({
    selector: 'la-status-info-modal',
    imports: [StatusBadgeComponent, CommonModule],
    templateUrl: './status-info-modal.component.html',
    styleUrl: './status-info-modal.component.scss'
})
export class StatusInfoModalComponent {
    public activeModal = inject(NgbActiveModal);
    public authService = inject(AuthService);

    public canChangeStatus$ = this.authService.currentUser$.pipe(map(user => user?.canChangeProblemStatus ?? false));

    public ProblemStatus = ProblemStatus;
}
