import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ProblemService } from "./problem.service";
import { Dataset, EntailmentLabel, ProblemResponse, ProblemStatus, SaveProblemResponse } from "@/types";
import { convertToParamMap } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { ParseInput } from "@/annotate/annotation-input/annotation-input.component";
import { firstValueFrom, take } from "rxjs";

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
        it("should handle 'None' problem ID", async () => {
            const responsePromise = firstValueFrom(service.problemResponse$.pipe(take(1)));

            service.allParams$.next({
                params: convertToParamMap({ problemId: null }),
                queryParams: convertToParamMap({}),
                edit: false
            });

            const response = await responsePromise;
            expect(response).toBeNull();
        });

        it("should fetch an existing problem", async () => {
            const mockProblemId = 123;
            const mockResponse: ProblemResponse = {
                problem: {
                    id: mockProblemId,
                    base: null,
                    dataset: Dataset.SICK,
                    premises: ["a"],
                    hypothesis: "b",
                    entailmentLabel: EntailmentLabel.ENTAILMENT,
                    extraData: {
                        pairId: 1,
                        relatednessScore: 4.5
                    },
                    kbAnnotations: [],
                    labelAnnotations: [],
                    hidden: false,
                    gold: false,
                    status: ProblemStatus.BRONZE,
                    langproPrediction: null,
                    usedKbItems: []
                },
                index: 1,
                total: 1,
                first: 123,
                last: 789,
                next: null,
                previous: null,
                error: null
            };

            const responsePromise = firstValueFrom(service.problemResponse$.pipe(take(1)));

            service.allParams$.next({
                params: convertToParamMap({ problemId: mockProblemId }),
                queryParams: convertToParamMap({}),
                edit: false
            });

            const req = httpMock.expectOne(`/api/problem/?text=&dataset=&status=&entailmentLabel=&hidden=&langproPrediction=&current=${mockProblemId}`);
            expect(req.request.method).toBe("GET");
            req.flush(mockResponse);

            const response = await responsePromise;
            expect(response).toEqual(mockResponse);
        });

        it("should handle HTTP errors when fetching a problem", async () => {
            const mockProblemId = "404";

            const responsePromise = firstValueFrom(service.problemResponse$.pipe(take(1)));

            service.allParams$.next({
                params: convertToParamMap({ problemId: mockProblemId }),
                queryParams: convertToParamMap({}),
                edit: false
            });

            const req = httpMock.expectOne(r => r.url === '/api/problem/');
            expect(req.request.method).toBe("GET");
            expect(req.request.params.get("text")).toBe("");
            expect(req.request.params.get("dataset")).toBe("");
            expect(req.request.params.get("status")).toBe("");
            expect(req.request.params.get("entailmentLabel")).toBe("");
            expect(req.request.params.get("current")).toBe(mockProblemId);
            req.flush("Not Found", { status: 404, statusText: "Not Found" });

            const response = await responsePromise;
            expect(response).toBeNull();
        });

        it("should include query parameters in the request", async () => {
            const queryParams = { text: "search", dataset: "FRACAS" };
            const responsePromise = firstValueFrom(service.problemResponse$.pipe(take(1)));

            service.allParams$.next({
                params: convertToParamMap({ problemId: "abc" }),
                queryParams: convertToParamMap(queryParams),
                edit: false
            });

            const req = httpMock.expectOne(r => r.url.startsWith("/api/problem/"));
            expect(req.request.params.get("text")).toBe("search");
            expect(req.request.params.get("dataset")).toBe("FRACAS");
            expect(req.request.params.get("status")).toBe("");
            expect(req.request.params.get("entailmentLabel")).toBe("");
            expect(req.request.params.get("current")).toBe("abc");
            req.flush({});

            await responsePromise;
        });
    });


    describe("saveProblem$", () => {
        it("should PATCH the problem and return the response", async () => {
            const problemToSave: ParseInput = {
                id: 1,
                base: null,
                premises: ["a"],
                hypothesis: "b",
                kbItems: [],
                langproPrediction: null,
                usedKbItems: []
            };
            const mockResponse: SaveProblemResponse = { id: 1, error: null };
            const responsePromise = firstValueFrom(service.saveProblem$.pipe(take(1)));

            service.submit$.next(problemToSave);

            const req = httpMock.expectOne("/api/problem/1/");
            expect(req.request.method).toBe("PATCH");
            expect(req.request.body).toEqual(problemToSave);
            req.flush(mockResponse);

            const response = await responsePromise;
            expect(response).toEqual(mockResponse);
        });

        it("should handle errors during save", async () => {
            const problemToSave: ParseInput = {
                id: 2,
                base: null,
                premises: ["c"],
                hypothesis: "d",
                kbItems: [],
                langproPrediction: null,
                usedKbItems: []
            };

            const responsePromise = firstValueFrom(service.saveProblem$.pipe(take(1)));

            service.submit$.next(problemToSave);

            const req = httpMock.expectOne("/api/problem/2/");
            req.flush("Error", { status: 500, statusText: "Server Error" });

            const response = await responsePromise;
            expect(response).toEqual({
                id: null,
                error: "Failed to save problem"
            });
        });
    });

    describe("firstProblemId$", () => {
        it("should fetch the first problem and return its ID", async () => {
            const mockResponse = { problem: { id: 555 } };
            const responsePromise = firstValueFrom(service.firstProblemId$.pipe(take(1)));

            const req = httpMock.expectOne("/api/problem/");
            expect(req.request.method).toBe("GET");
            req.flush(mockResponse);

            const response = await responsePromise;
            expect(response).toBe(555);
        });

        it("should return null if fetching the first problem fails", async () => {
            const responsePromise = firstValueFrom(service.firstProblemId$.pipe(take(1)));

            const req = httpMock.expectOne("/api/problem/");
            req.flush("Error", { status: 500, statusText: "Server Error" });

            const response = await responsePromise;
            expect(response).toBeNull();
        });
    });
});
