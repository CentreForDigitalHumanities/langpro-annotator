import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProblemService } from '@/services/problem.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@/services/auth.service';
import { map, combineLatest, Subject, startWith, defer, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { formatDate } from '@/util';
import { LabelAnnotation } from '@/types';

type SelectedLabelsForm = FormGroup<{
    problemId: FormControl<number>;
    selectedLabelIds: FormControl<number[]>;
}>;

export type ManageLabelsModalResult = ReturnType<SelectedLabelsForm['getRawValue']>;

@Component({
    selector: 'la-manage-labels-modal',
    imports: [ReactiveFormsModule, AsyncPipe],
    templateUrl: './manage-labels-modal.component.html',
    styleUrl: './manage-labels-modal.component.scss'
})
export class ManageLabelsModalComponent implements OnInit {
    private problemService = inject(ProblemService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    public form: SelectedLabelsForm = new FormGroup({
        problemId: new FormControl<number>(-1, { nonNullable: true }),
        selectedLabelIds: new FormControl<number[]>([], {
            nonNullable: true,
        }),
    });

    /** Takes a Label ID and adds it to selected */
    private addLabelId$ = new Subject<number>();

    public currentAnnotations: LabelAnnotation[] = [];

    public allLabels$ = this.problemService.allLabels$;

    // Defer ensures that the form has the correct values before we subscribe to valueChanges.
    public selectedLabelIds$ = defer(() => this.form.controls.selectedLabelIds.valueChanges.pipe(
        startWith(this.form.controls.selectedLabelIds.value),
    ));

    /** Combines selected IDs with existing annotations and all labels to show what's selected */
    public shownLabels$: Observable<LabelAnnotation[]> = combineLatest([
        this.allLabels$,
        this.selectedLabelIds$
    ]).pipe(
        map(([allLabels, selectedIds]) => {
            if (!allLabels) {
                return [];
            }
            // Show existing annotations that are still selected, plus new ones
            return selectedIds.map(labelId => {
                const existing = this.currentAnnotations.find(a => a.label.id === labelId);
                if (existing) {
                    return existing;
                }
                // Create a simple display object for newly selected labels
                const label = allLabels.find(l => l.id === labelId);
                if (!label) {
                    return null;
                }

                const newAnnotation: LabelAnnotation = {
                    id: null,
                    label,
                    createdAt: new Date().toISOString(),
                    createdBy: this.currentUserName() ?? $localize`Unknown user`,
                    attachedByCurrentUser: true,
                    session: null,
                    removedAt: null,
                    removedBy: null,
                    notes: '',
                    removable: true,

                };
                return newAnnotation;
            }).filter((a) => a !== null);
        })
    );

    public availableLabels$ = combineLatest([
        this.allLabels$,
        this.selectedLabelIds$
    ]).pipe(
        map(([allLabels, selectedIds]) => {
            if (!allLabels) {
                return [];
            }
            return allLabels.filter(label => !selectedIds.includes(label.id));
        })
    );

    public loadingLabels$ = this.availableLabels$.pipe(
        map(() => false),
        startWith(true)
    );

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        // Handle add label operations
        this.addLabelId$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((labelId) => {
            const currentSelected = this.form.controls.selectedLabelIds.value;
            if (!currentSelected.includes(labelId)) {
                this.form.controls.selectedLabelIds.setValue([...currentSelected, labelId]);
            }
        });
    }

    public removeLabel(labelId: number): void {
        const currentSelected = this.form.controls.selectedLabelIds.value;
        this.form.controls.selectedLabelIds.setValue(
            currentSelected.filter(id => id !== labelId)
        );
    }

    public addLabelAnnotation(labelId: number): void {
        this.addLabelId$.next(labelId);
    }

    public closeModal(): void {
        const formValue = this.form.getRawValue();
        // Transform selectedLabelIds to the expected backend format
        const transformedValue = {
            ...formValue,
            selectedLabels: formValue.selectedLabelIds.map(id => ({ id }))
        };
        this.activeModal.close(transformedValue);
    }

    public getAttachedByText(annotation: LabelAnnotation): string {
        const attachedUser = annotation.attachedByCurrentUser ? $localize`you` : annotation.createdBy;
        return $localize`Attached by ${attachedUser} on ${formatDate(annotation.createdAt)}`;
    }

    private currentUserName = toSignal(
        this.authService.currentUser$.pipe(map((user) => user?.username))
    );
}
