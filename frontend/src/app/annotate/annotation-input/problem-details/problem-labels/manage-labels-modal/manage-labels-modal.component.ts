import { Component, computed, inject, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Label, ProblemLabel } from '@/types';
import { ProblemService } from '@/services/problem.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@/services/auth.service';
import { map } from 'rxjs';

@Component({
    selector: 'la-manage-labels-modal',
    imports: [ReactiveFormsModule],
    templateUrl: './manage-labels-modal.component.html',
    styleUrl: './manage-labels-modal.component.scss'
})
export class ManageLabelsModalComponent {
    private problemService = inject(ProblemService);
    private authService = inject(AuthService);

    public selected = signal<ProblemLabel[]>([]);
    public labelsChanged = output<ProblemLabel[]>();

    public allLabels = toSignal<Label[]>(this.problemService.allLabels$);

    public availableLabels = computed(() => {
        const allLabels = this.allLabels();
        if (!allLabels) {
            return [];
        }
        const selectedIds = this.selected().map(label => label.id);
        return allLabels.filter(label => !selectedIds.includes(label.id));
    });

    constructor(public activeModal: NgbActiveModal) { }

    public removeLabel(labelId: number): void {
        const currentSelected = this.selected();
        const label = currentSelected.find(l => l.id === labelId);
        if (!label) {
            return;
        }

        label.attachedInfo = null;
        label.removable = true;
        this.selected.set(currentSelected.filter(l => l.id !== labelId));
    }

    public addLabel(labelId: number): void {
        const currentSelected = this.selected();
        const label = this.allLabels()?.find(l => l.id === labelId);
        if (!label) {
            return;
        }

        const newLabel: ProblemLabel = {
            id: label.id,
            text: label.text,
            description: label.description,
            attachedInfo: {
                userName: this.currentUserName() ?? $localize`Unknown user`,
                date: new Date(),
                currentUser: true
            },
            removable: true
        };
        this.selected.set([...currentSelected, newLabel]);
    }

    public closeModal(options: { save: boolean; } = { save: true }): void {
        if (!options.save) {
            this.activeModal.dismiss();
            return;
        }
        this.labelsChanged.emit(this.selected());
        this.activeModal.close();
    }

    public getAttachedByText(label: ProblemLabel): string {
        if (!label.attachedInfo) {
            return '';
        }
        const attachedUser = label.attachedInfo.currentUser ? $localize`you` : label.attachedInfo.userName;
        return $localize`Attached by ${attachedUser} on ${this.formatDate(label.attachedInfo.date)}`;
    }

    private formatDate(date: Date): string {
        return Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    }

    private currentUserName = toSignal(
        this.authService.currentUser$.pipe(map((user) => user?.username))
    );
}
