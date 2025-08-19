import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from "@angular/common";

export interface SelectOption<T> {
    value: T | null;
    label: string;
}

@Component({
    selector: "la-filter-select",
    imports: [NgbDropdownModule, CommonModule],
    templateUrl: "./filter-select.component.html",
    styleUrl: "./filter-select.component.scss",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FilterSelectComponent),
            multi: true,
        },
    ],
})
export class FilterSelectComponent<T> implements ControlValueAccessor {
    @Input({ required: true }) options: SelectOption<T>[] = [];
    @Input() placeholder: string = "Select...";
    @Input() showAllOption: boolean = true;

    selectedValue: T | null = null;
    isDisabled: boolean = false;

    private onChange = (value: T | null) => { };
    private onTouched = () => { };

    writeValue(value: T | null): void {
        this.selectedValue = value;
    }

    registerOnChange(fn: (value: T | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onOptionSelect(value: T | null): void {
        if (!this.isDisabled) {
            this.selectedValue = value;
            this.onChange(value);
            this.onTouched();
        }
    }

    getSelectedLabel(): string {
        if (this.selectedValue === null || this.selectedValue === undefined) {
            return this.showAllOption ? $localize`All` : this.placeholder;
        }

        const selectedOption = this.options.find(
            (option) => option.value === this.selectedValue
        );
        return selectedOption ? selectedOption.label : this.placeholder;
    }

    isOptionActive(value: T | null): boolean {
        return this.selectedValue === value;
    }
}
