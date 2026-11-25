import { AnnotationEventKind, AnnotationKind } from "@/types";
import { Component, computed, input, output } from "@angular/core";
import { FontAwesomeModule, IconDefinition } from "@fortawesome/angular-fontawesome";
import { faBook, faMedal, faMinus, faPen, faPlus, faTag } from "@fortawesome/free-solid-svg-icons";

type FilterType = AnnotationEventKind | AnnotationKind;

interface FilterProps {
    icon: IconDefinition;
    label: string;
    buttonClass: string;
}

const FILTER_PROPS: Record<FilterType, FilterProps> = {
    created: {
        icon: faPlus,
        label: $localize`Added`,
        buttonClass: "btn-outline-success",
    },
    removed: {
        icon: faMinus,
        label: $localize`Removed`,
        buttonClass: "btn-outline-danger",
    },
    updated: {
        icon: faPen,
        label: $localize`Edited`,
        buttonClass: "btn-outline-primary",
    },
    label: {
        icon: faTag,
        label: $localize`Labels`,
        buttonClass: "btn-outline-secondary",
    },
    knowledgeBase: {
        icon: faBook,
        label: $localize`KB items`,
        buttonClass: "btn-outline-secondary",
    },
    status: {
        icon: faMedal,
        label: $localize`Status`,
        buttonClass: "btn-outline-secondary",
    },
};

@Component({
    selector: "la-filter-checkbox",
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: "./filter-checkbox.component.html",
    styleUrl: "./filter-checkbox.component.scss",
})
export class FilterCheckboxComponent {
    label = input.required<FilterType>();
    checked = input.required<boolean>();
    toggle = output<void>();

    filterProps = computed(() => FILTER_PROPS[this.label()]);
}
