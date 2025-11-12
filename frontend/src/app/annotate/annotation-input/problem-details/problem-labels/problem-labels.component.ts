import { Component, computed, input, OnInit } from '@angular/core';
import { ProblemLabel } from '../problem-details.component';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTooltipModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { ManageLabelsModalComponent } from './manage-labels-modal/manage-labels-modal.component';

@Component({
    selector: 'la-problem-labels',
    imports: [FontAwesomeModule, NgbTooltipModule],
    templateUrl: './problem-labels.component.html',
    styleUrl: './problem-labels.component.scss'
})
export class ProblemLabelsComponent {
    public attachedLabels = input.required<ProblemLabel[]>();
    public faSearch = faSearch;

    public sortedLabels = computed(() => {
        return this.sortLabels(this.attachedLabels());
    });

    constructor(private modalService: NgbModal) { }

    public openManageLabelsModal(): void {
        const modalRef = this.modalService.open(ManageLabelsModalComponent, {
            centered: true,
            size: 'lg'
        });

        modalRef.componentInstance.selected.set(this.sortedLabels());

        const subscription = modalRef.componentInstance.labelsChanged.subscribe((selectedLabels: ProblemLabel[]) => {
            // TODO: Submit the selected labels to the backend or parent component and refetch.
            console.log('Submitting selected labels:', selectedLabels);
        });

        modalRef.result.finally(() => {
            subscription.unsubscribe();
        });
    }

    public getTooltipText(label: ProblemLabel): string {
        let tooltip = label.description;
        if (label.attachedInfo) {
            const dateStr = this.formatDate(label.attachedInfo.date);
            const attachedUser = label.attachedInfo.currentUser ? $localize`you` : label.attachedInfo.userName;
            tooltip += `\n\nAttached by ${attachedUser} on ${dateStr}`;
        }
        return tooltip;
    }

    public formatDate(date: Date): string {
        return Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    }

    /**
     * Make sure that the user's own labels are always last.
     */
    private sortLabels(labels: ProblemLabel[]): ProblemLabel[] {
        const userLabels = labels.filter(label => label.attachedInfo?.currentUser);
        const otherLabels = labels.filter(label => !label.attachedInfo?.currentUser);
        return [...otherLabels, ...userLabels];
    }
}
