import { TestBed } from "@angular/core/testing";

import { AnnotateService } from "./annotate.service";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("AnnotateService", () => {
    let service: AnnotateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(AnnotateService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
