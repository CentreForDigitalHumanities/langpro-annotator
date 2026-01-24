import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProblemLabel } from '@/types';
import { ProblemService } from '@/services/problem.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@/services/auth.service';
import { map, combineLatest, Subject, withLatestFrom, startWith, defer } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { formatDate } from '@/util';

type SelectedLabelsForm = FormGroup<{
    problemId: FormControl<number>;
    selectedLabels: FormControl<ProblemLabel[]>;
    remarks: FormControl<string>;
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
        selectedLabels: new FormControl<ProblemLabel[]>([], {
            nonNullable: true,
        }),
        remarks: new FormControl<string>('', { nonNullable: true }),
    });

    private addLabelSubject = new Subject<number>();
    private removeLabelSubject = new Subject<number>();

    public allLabels$ = this.problemService.allLabels$;

    // Defer ensures that the form has the correct values before we subscribe to valueChanges.
    public selectedLabels$ = defer(() => this.form.controls.selectedLabels.valueChanges.pipe(
        startWith(this.form.controls.selectedLabels.value),
    ));

    public availableLabels$ = combineLatest([
        this.allLabels$,
        this.selectedLabels$
    ]).pipe(
        map(([allLabels, selectedLabels]) => {
            if (!allLabels) {
                return [];
            }
            const selectedIds = selectedLabels.map(label => label.id);
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
        this.addLabelSubject.pipe(
            withLatestFrom(this.allLabels$),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(([labelId, allLabels]) => {
            const currentSelected = this.form.controls.selectedLabels.value;
            const label = allLabels?.find(l => l.id === labelId);

            if (!label) {
                return;
            }

            const newLabel: ProblemLabel = {
                id: label.id,
                text: label.text,
                description: label.description,
                attachedInfo: {
                    userName: this.currentUserName() ?? $localize`Unknown user`,
                    date: new Date().toISOString(),
                    attachedByCurrentUser: true
                },
                removable: true
            };
            this.form.controls.selectedLabels.setValue([...currentSelected, newLabel]);
        });

        this.removeLabelSubject.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((labelId) => {
            const currentSelected = this.form.controls.selectedLabels.value;
            const label = currentSelected.find(l => l.id === labelId);

            if (!label) {
                return;
            }

            label.attachedInfo = null;
            label.removable = true;
            this.form.controls.selectedLabels.setValue(currentSelected.filter(l => l.id !== labelId));
        });
    }

    public removeLabel(labelId: number): void {
        this.removeLabelSubject.next(labelId);
    }

    public addLabel(labelId: number): void {
        this.addLabelSubject.next(labelId);
    }

    public closeModal(): void {
        this.activeModal.close(this.form.getRawValue());
    }

    public getAttachedByText(label: ProblemLabel): string {
        if (!label.attachedInfo) {
            return '';
        }
        const attachedUser = label.attachedInfo.attachedByCurrentUser ? $localize`you` : label.attachedInfo.userName;
        return $localize`Attached by ${attachedUser} on ${formatDate(label.attachedInfo.date)}`;
    }

    private currentUserName = toSignal(
        this.authService.currentUser$.pipe(map((user) => user?.username))
    );
}
