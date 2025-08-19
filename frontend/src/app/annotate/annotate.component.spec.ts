import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnnotateComponent } from "./annotate.component";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("AnnotateComponent", () => {
    let component: AnnotateComponent;
    let fixture: ComponentFixture<AnnotateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnnotateComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: ActivatedRoute,
                    useValue: {
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
