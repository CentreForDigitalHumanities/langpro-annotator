import { Dataset, EntailmentLabel } from "@/types";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { BehaviorSubject } from "rxjs";
import {
    FilterSelectComponent,
    SelectOption,
} from "./filter-select/filter-select.component";
import { datasetLabels, entailmentLabels } from "@/shared/displayTextMappings";

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
    ],
    templateUrl: "./search.component.html",
    styleUrl: "./search.component.scss",
})
export class SearchComponent {
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

    private entailmentLabels = entailmentLabels;
    private datasetLabels = datasetLabels;

    public datasetOptions: SelectOption<Dataset>[] = Object.values(Dataset).map(
        (dataset) => ({
            value: dataset,
            label: this.datasetLabels[dataset],
        })
    );

    public entailmentLabelOptions: SelectOption<EntailmentLabel>[] = Object.values(EntailmentLabel).map(
        (label) => ({
            value: label,
            label: this.entailmentLabels[label],
        })
    );

    public goldOptions: SelectOption<boolean>[] = [
        { value: true, label: $localize`Gold Only` },
        { value: false, label: $localize`Non-Gold Only` },
    ];

    // TODO: remove!
    ngOnInit(): void {
        this.form.valueChanges.subscribe((value) => {
            console.log('Search form changed:', value);
        });
    }

    public clearFilters(): void {
        this.form.reset();
    }
}
