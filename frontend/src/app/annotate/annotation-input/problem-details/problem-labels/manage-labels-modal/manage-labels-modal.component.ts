import { Component, computed, output, signal } from '@angular/core';
import { ProblemLabel } from '../../problem-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { mockLabels } from '../mockLabels';

@Component({
    selector: 'la-manage-labels-modal',
    imports: [ReactiveFormsModule],
    templateUrl: './manage-labels-modal.component.html',
    styleUrl: './manage-labels-modal.component.scss'
})
export class ManageLabelsModalComponent {
    public selected = signal<ProblemLabel[]>([]);
    public labelsChanged = output<ProblemLabel[]>();

    public allLabels = mockLabels;

    public availableLabels = computed(() => {
        const selectedIds = this.selected().map(label => label.id);
        return this.allLabels.filter(label => !selectedIds.includes(label.id));
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
        const label = this.allLabels.find(l => l.id === labelId);
        if (!label) {
            return;
        }

        label.attachedInfo = {
            userName: 'Current User',
            date: new Date(),
            currentUser: true
        };
        label.removable = true;
        this.selected.set([...currentSelected, label]);
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
}
