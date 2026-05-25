import { Dataset, EntailmentLabel, ProblemStatus } from "@/types";
import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCircleInfo, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { NgbDropdownModule, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BehaviorSubject, map } from "rxjs";
import {
    FilterSelectComponent,
    SelectOption,
} from "./filter-select/filter-select.component";
import { datasetLabels, entailmentLabels, statusLabels } from "@/shared/displayTextMappings";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { IconButtonComponent } from "@/shared/icon-button/icon-button.component";
import { AuthService } from "@/services/auth.service";
import { StatusInfoModalComponent } from "./status-info-modal/status-info-modal.component";

interface SearchParams {
    dataset: Dataset | null;
    entailmentLabel: EntailmentLabel | null;
    status: ProblemStatus | null;
    text: string | null;
    hidden: boolean | null;
}

type SearchParamsForm = {
    [key in keyof SearchParams]: FormControl<SearchParams[key]>;
};

@Component({
    selector: "la-search",
    imports: [
        FormsModule,
        NgbDropdownModule,
        CommonModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        FilterSelectComponent,
        IconButtonComponent
    ],
    templateUrl: "./search.component.html",
    styleUrl: "./search.component.scss",
})
export class SearchComponent {
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);
    private modalService = inject(NgbModal);

    public form = new FormGroup<SearchParamsForm>({
        dataset: new FormControl<Dataset | null>(null),
        entailmentLabel: new FormControl<EntailmentLabel | null>(null),
        status: new FormControl<ProblemStatus | null>(null),
        text: new FormControl<string | null>(""),
        hidden: new FormControl<boolean | null>(null),
    });

    // TODO: Use actual loading state...
    loading$ = new BehaviorSubject<boolean>(false);

    public canChangeVisibility$ = this.authService.currentUser$.pipe(
        map(user => user?.canChangeProblemVisibility ?? false)
    );

    public faSearch = faSearch;
    public faTimes = faTimes;
    public faCircleInfo = faCircleInfo;

    public datasetOptions: SelectOption<Dataset>[] = Object.values(Dataset).map(
        (dataset) => ({
            value: dataset,
            label: datasetLabels[dataset],
        })
    );

    public entailmentLabelOptions: SelectOption<EntailmentLabel>[] = Object.values(EntailmentLabel).map(
        (label) => ({
            value: label,
            label: entailmentLabels[label],
        })
    );

    public statusOptions: SelectOption<ProblemStatus>[] = Object.values(ProblemStatus).map(
        (status) => ({
            value: status,
            label: statusLabels[status],
        })
    );

    public hiddenOptions: SelectOption<boolean>[] = [
        { value: true, label: $localize`Hidden Only` },
        { value: false, label: $localize`Visible Only` },
    ];

    ngOnInit(): void {
        // Update URL when form changes.
        this.form.valueChanges
            .pipe(
                map(() => this.form.getRawValue()),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((value: SearchParams) => {
                this.updateUrl(value);
            });

        // Update form when URL changes.
        this.route.queryParamMap.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(queryParams => {
            const dataset = queryParams.get('dataset');
            const entailmentLabel = queryParams.get('entailmentLabel');
            const status = queryParams.get('status');

            this.form.patchValue({
                dataset: this.isDataset(dataset) ? dataset : null,
                entailmentLabel: this.isEntailmentLabel(entailmentLabel) ? entailmentLabel : null,
                status: this.isProblemStatus(status) ? status : null,
                text: queryParams.get('text') as string | null,
                hidden: queryParams.get('hidden') === null ? null : queryParams.get('hidden') === 'true',
            });
        });
    }

    // Type guards to check validity of query params.
    private isDataset(value: string | null): value is Dataset {
        return value !== null && Object.values(Dataset).includes(value as Dataset);
    }

    private isEntailmentLabel(value: string | null): value is EntailmentLabel {
        return value !== null && Object.values(EntailmentLabel).includes(value as EntailmentLabel);
    }

    private isProblemStatus(value: string | null): value is ProblemStatus {
        return value !== null && Object.values(ProblemStatus).includes(value as ProblemStatus);
    }

    public clearFilters(): void {
        this.form.reset();
    }

    public showStatusInfoModal(): void {
        this.modalService.open(StatusInfoModalComponent, {
            centered: true,
        });
    }

    // Updates the route, which triggers a new query.
    private updateUrl(searchParams: SearchParams): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: searchParams,
            queryParamsHandling: 'merge',
        });
    }
}
