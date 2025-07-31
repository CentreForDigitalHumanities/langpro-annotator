import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FilterSelectComponent } from "./filter-select.component";

describe("FilterSelectComponent", () => {
    let component: FilterSelectComponent<string>;
    let fixture: ComponentFixture<FilterSelectComponent<string>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FilterSelectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FilterSelectComponent<string>);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
