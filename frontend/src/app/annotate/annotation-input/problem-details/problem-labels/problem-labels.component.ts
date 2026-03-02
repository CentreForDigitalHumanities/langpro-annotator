import { Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTooltipModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ManageLabelsModalComponent, ManageLabelsModalResult } from './manage-labels-modal/manage-labels-modal.component';
import { LabelAnnotation, SaveLabelsResponse } from '@/types';
import { catchError, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { ProblemService } from '@/services/problem.service';
import { getLabelTooltipText, sortAnnotations } from '@/util';

@Component({
    selector: 'la-problem-labels',
    imports: [FontAwesomeModule, NgbTooltipModule],
    templateUrl: './problem-labels.component.html',
    styleUrl: './problem-labels.component.scss'
})
export class ProblemLabelsComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    private toastService = inject(ToastService);
    private http = inject(HttpClient);
    private problemService = inject(ProblemService);

    public problemId = input.required<string>();
    public labelAnnotations = input.required<LabelAnnotation[]>();

    public sortedAnnotations = computed(() => {
        return sortAnnotations(this.labelAnnotations());
    });

    public faSearch = faSearch;

    private saveLabels$ = new Subject<ManageLabelsModalResult>();

    constructor(private modalService: NgbModal) { }

    ngOnInit(): void {
        this.saveLabels$.pipe(
            switchMap(value => this.http.post<SaveLabelsResponse>("/api/label/", value)),
            takeUntilDestroyed(this.destroyRef),
            catchError((error) => {
                this.toastService.show(
                    {
                        header: $localize`Failed to save labels.`,
                        body: error,
                        type: 'danger'
                    });
                return [];
            })
        ).subscribe((result) => {
            if (result.ok) {
                this.toastService.show(
                    {
                        header: $localize`Success`,
                        type: 'success',
                        body: $localize`Labels saved successfully.`
                    });
                this.problemService.refetchProblem$.next();
                return;
            }
            this.toastService.show({
                header: $localize`Failed to save labels.`,
                body: result.error || '',
                type: 'danger'
            });
        });
    }

    public getTooltipText = getLabelTooltipText;

    public openManageLabelsModal(): void {
        const modalRef = this.modalService.open(ManageLabelsModalComponent, {
            centered: true,
            size: 'lg'
        });

        const currentAnnotations = this.labelAnnotations();
        modalRef.componentInstance.currentAnnotations = currentAnnotations;

        // Initialize form with currently selected label IDs
        modalRef.componentInstance.form.patchValue({
            problemId: this.problemId(),
            selectedLabelIds: currentAnnotations.map(a => a.label.id)
        });

        modalRef.result?.then((result: ManageLabelsModalResult) => {
            this.saveLabels$.next(result);
        }).catch(() => {
            // Modal was dismissed (cancelled), do nothing.
        });
    }
}
