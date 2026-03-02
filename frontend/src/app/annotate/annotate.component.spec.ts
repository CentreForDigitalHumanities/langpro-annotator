import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnnotateComponent } from "./annotate.component";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { CommonModule } from "@angular/common";

describe("AnnotateComponent", () => {
    let component: AnnotateComponent;
    let fixture: ComponentFixture<AnnotateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnnotateComponent, CommonModule],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        url: of([]),
                        paramMap: of({}),
                        queryParamMap: of({})
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AnnotateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
