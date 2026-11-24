import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FilterCheckboxComponent } from "./filter-checkbox.component";
import { ComponentRef } from "@angular/core";

describe("FilterCheckboxComponent", () => {
    let component: FilterCheckboxComponent;
    let fixture: ComponentFixture<FilterCheckboxComponent>;
    let componentRef: ComponentRef<FilterCheckboxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FilterCheckboxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FilterCheckboxComponent);
        componentRef = fixture.componentRef;
        component = fixture.componentInstance;

        componentRef.setInput("label", "created");
        componentRef.setInput("checked", true);

        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
