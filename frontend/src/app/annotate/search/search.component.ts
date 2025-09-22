import { Dataset, EntailmentLabel } from "@/types";
import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import {
    FilterSelectComponent,
    SelectOption,
} from "./filter-select/filter-select.component";
import { datasetLabels, entailmentLabels } from "@/shared/displayTextMappings";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { IconButtonComponent } from "@/shared/icon-button/icon-button.component";

interface SearchParams {
    dataset: Dataset | null;
    entailmentLabel: EntailmentLabel | null;
    gold: boolean | null;
    text: string | null;
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

    public form = new FormGroup<SearchParamsForm>({
        dataset: new FormControl<Dataset | null>(null),
        entailmentLabel: new FormControl<EntailmentLabel | null>(null),
        gold: new FormControl<boolean | null>(null),
        text: new FormControl<string | null>(""),
    });

    // TODO: Use actual loading state...
    loading$ = new BehaviorSubject<boolean>(false);

    public faSearch = faSearch;
    public faTimes = faTimes;

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

    public goldOptions: SelectOption<boolean>[] = [
        { value: true, label: $localize`Gold Only` },
        { value: false, label: $localize`Non-Gold Only` },
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

            this.form.patchValue({
                dataset: this.isDataset(dataset) ? dataset : null,
                entailmentLabel: this.isEntailmentLabel(entailmentLabel) ? entailmentLabel : null,
                gold: queryParams.get('gold') === null ? null : queryParams.get('gold') === 'true',
                text: queryParams.get('text') as string | null,
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

    public clearFilters(): void {
        this.form.reset();
    }

    // Updates the route, which triggers a new query.
    private updateUrl(searchParams: SearchParams): void {
        const url = this.router.createUrlTree([], {
            relativeTo: this.route,
            queryParams: searchParams
        }).toString();
        this.router.navigateByUrl(url);
    }
}
