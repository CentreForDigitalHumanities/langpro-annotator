import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchComponent } from "./search.component";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("SearchComponent", () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchComponent],
            providers: [
                provideHttpClient(withInterceptorsFromDi()),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ problemId: "1" }),
                        queryParamMap: of({ dataset: null, entailmentLabel: null, status: null, text: "" }),
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
