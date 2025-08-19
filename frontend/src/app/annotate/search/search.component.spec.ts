import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchComponent } from "./search.component";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

describe("SearchComponent", () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchComponent],
            providers: [{
                provide: ActivatedRoute,
                useValue: {
                    params: of({ problemId: "1" }),
                    queryParamMap: of({ dataset: null, entailmentLabel: null, gold: null, text: "" }),
                }
            }]
        }).compileComponents();

        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
