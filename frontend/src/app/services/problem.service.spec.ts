import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ProblemService } from "./problem.service";
import { Dataset, EntailmentLabel, Problem, ProblemResponse, SaveProblemResponse } from "@/types";
import { convertToParamMap } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { ParseInput } from "@/annotate/annotation-input/annotation-input.component";

describe("ProblemService", () => {
    let service: ProblemService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                ProblemService
            ],
        });
        service = TestBed.inject(ProblemService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    describe("problemResponse$", () => {
        it("should handle 'None' problem ID", (done) => {
            service.allParams$.next({
                params: convertToParamMap({ problemId: null }),
                queryParams: convertToParamMap({}),
                edit: false
            });

            service.problemResponse$.subscribe(response => {
                expect(response).toEqual(null);
                done();
            });
        });

        it("should fetch an existing problem", (done) => {
            const mockProblemId = 123;
            const mockResponse: ProblemResponse = {
                problem: {
                    id: mockProblemId,
                    base: null,
                    dataset: Dataset.SICK,
                    premises: ["a"],
                    hypothesis: "b",
                    entailmentLabel: EntailmentLabel.ENTAILMENT,
                    kbItems: [],
                    extraData: {
                        pairId: 1,
                        relatednessScore: 4.5
                    }
                },
                index: 1,
                totalProblems: 1,
                firstProblemId: 123,
                lastProblemId: 789,
                nextProblemId: null,
                previousProblemId: null,
                error: null
            };

            service.allParams$.next({
                params: convertToParamMap({ problemId: mockProblemId }),
                queryParams: convertToParamMap({}),
                edit: false
            });

            service.problemResponse$.subscribe(response => {
                expect(response).toEqual(mockResponse);
                done();
            });

            const req = httpMock.expectOne(`/api/problem/${mockProblemId}?text=&dataset=&gold=&entailmentLabel=`);
            expect(req.request.method).toBe("GET");
            req.flush(mockResponse);
        });

        it("should handle HTTP errors when fetching a problem", (done) => {
            const mockProblemId = "404";

            service.problemResponse$.subscribe(response => {
                expect(response).toBeNull();
                done();
            });

            service.allParams$.next({
                params: convertToParamMap({ problemId: mockProblemId }),
                queryParams: convertToParamMap({}),
                edit: false
            });

            const req = httpMock.expectOne(r => r.url.startsWith(`/api/problem/${mockProblemId}`));
            expect(req.request.method).toBe("GET");
            expect(req.request.params.get("text")).toBe("");
            expect(req.request.params.get("dataset")).toBe("");
            expect(req.request.params.get("gold")).toBe("");
            expect(req.request.params.get("entailmentLabel")).toBe("");
            req.flush("Not Found", { status: 404, statusText: "Not Found" });
        });

        it("should include query parameters in the request", (done) => {
            const queryParams = { text: "search", dataset: "FRACAS" };
            service.allParams$.next({
                params: convertToParamMap({ problemId: "abc" }),
                queryParams: convertToParamMap(queryParams),
                edit: false
            });

            service.problemResponse$.subscribe(() => done());

            const req = httpMock.expectOne(r => r.url.startsWith("/api/problem/abc"));
            expect(req.request.params.get("text")).toBe("search");
            expect(req.request.params.get("dataset")).toBe("FRACAS");
            expect(req.request.params.get("gold")).toBe("");
            expect(req.request.params.get("entailmentLabel")).toBe("");
            req.flush({});
        });
    });


    describe("saveProblem$", () => {
        it("should POST the problem and return the response", (done) => {
            const problemToSave: ParseInput = {
                id: 1,
                base: null,
                premises: ["a"],
                hypothesis: "b",
                kbItems: [],
            };
            const mockResponse: SaveProblemResponse = { id: 1, error: null };

            service.saveProblem$.subscribe(response => {
                expect(response).toEqual(mockResponse);
                done();
            });

            service.submit$.next(problemToSave);

            const req = httpMock.expectOne("/api/problem/1");
            expect(req.request.method).toBe("POST");
            expect(req.request.body).toEqual(problemToSave);
            req.flush(mockResponse);
        });

        it("should handle errors during save", (done) => {
            const problemToSave: ParseInput = {
                id: 2,
                base: null,
                premises: ["c"],
                hypothesis: "d",
                kbItems: []
            };

            service.saveProblem$.subscribe(response => {
                expect(response.id).toBeNull();
                expect(response.error).toBe("Failed to save problem");
                done();
            });

            service.submit$.next(problemToSave);

            const req = httpMock.expectOne("/api/problem/2");
            req.flush("Error", { status: 500, statusText: "Server Error" });
        });
    });

    describe("firstProblemId$", () => {
        it("should fetch the first problem and return its ID", (done) => {
            const mockResponse = { problem: { id: 555 } };

            service.firstProblemId$.subscribe(id => {
                expect(id).toBe(555);
                done();
            });

            const req = httpMock.expectOne("/api/problem/");
            expect(req.request.method).toBe("GET");
            req.flush(mockResponse);
        });

        it("should return null if fetching the first problem fails", (done) => {
            service.firstProblemId$.subscribe(id => {
                expect(id).toBeNull();
                done();
            });

            const req = httpMock.expectOne("/api/problem/");
            req.flush("Error", { status: 500, statusText: "Server Error" });
        });
    });
});
