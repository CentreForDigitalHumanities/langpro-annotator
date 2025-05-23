import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NavigatorComponent } from "./navigator.component";
import { ActivatedRoute } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { of } from "rxjs";

describe("NavigatorComponent", () => {
    let component: NavigatorComponent;
    let fixture: ComponentFixture<NavigatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NavigatorComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ problemId: "1" }),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NavigatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
