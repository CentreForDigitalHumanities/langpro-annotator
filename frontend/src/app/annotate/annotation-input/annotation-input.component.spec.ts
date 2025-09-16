import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormArray, FormGroup } from "@angular/forms";

import { AnnotationInputComponent } from "./annotation-input.component";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { Dataset, KnowledgeBaseRelationship, Problem, EntailmentLabel } from "../../types";

describe("AnnotationInputComponent", () => {
    let component: AnnotationInputComponent;
    let fixture: ComponentFixture<AnnotationInputComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        mockActivatedRoute = {
            params: of({ problemId: "1" }),
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy('get').and.returnValue('current-problem-id')
                }
            }
        };

        await TestBed.configureTestingModule({
            imports: [AnnotationInputComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: routerSpy }
            ],
        }).compileComponents();

        mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(AnnotationInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe('buildForm', () => {
        it('should build form with correct structure and values from problem data', () => {
            const mockProblem: Problem = {
                id: "test-123",
                premises: ["First premise", "Second premise"],
                hypothesis: "Test hypothesis",
                entailmentLabel: EntailmentLabel.ENTAILMENT,
                kbItems: [
                    {
                        id: "kb1",
                        entity1: "cat",
                        entity2: "animal",
                        relationship: KnowledgeBaseRelationship.SUBSET
                    },
                    {
                        id: "kb2",
                        entity1: "dog",
                        entity2: "pet",
                        relationship: KnowledgeBaseRelationship.EQUAL
                    }
                ],
                dataset: Dataset.USER,
                extraData: null
            };

            // Access private method.
            const form = component['buildForm'](mockProblem);

            // Test form structure
            expect(form).toBeTruthy();
            expect(form.get('id')?.value).toBe('test-123');
            expect(form.get('hypothesis')?.value).toBe('Test hypothesis');

            // Test premises array
            const premisesArray = form.get('premises') as FormArray;
            expect(premisesArray.length).toBe(2);
            expect(premisesArray.at(0).value).toBe('First premise');
            expect(premisesArray.at(1).value).toBe('Second premise');

            // Test knowledge base items
            const kbItemsArray = form.get('kbItems') as FormArray;
            expect(kbItemsArray.length).toBe(2);

            const firstKbForm = kbItemsArray.at(0) as FormGroup;
            expect(firstKbForm.get('id')?.value).toBe('kb1');
            expect(firstKbForm.get('entity1')?.value).toBe('cat');
            expect(firstKbForm.get('entity2')?.value).toBe('animal');
            expect(firstKbForm.get('relationship')?.value).toBe(KnowledgeBaseRelationship.SUBSET);

            const secondKbForm = kbItemsArray.at(1) as FormGroup;
            expect(secondKbForm.get('id')?.value).toBe('kb2');
            expect(secondKbForm.get('entity1')?.value).toBe('dog');
            expect(secondKbForm.get('entity2')?.value).toBe('pet');
            expect(secondKbForm.get('relationship')?.value).toBe(KnowledgeBaseRelationship.EQUAL);
        });

        it('should handle empty premises and kbItems arrays', () => {
            const mockProblem: Problem = {
                id: "empty-test",
                premises: [],
                hypothesis: "Empty test hypothesis",
                entailmentLabel: EntailmentLabel.NEUTRAL,
                kbItems: [],
                dataset: Dataset.USER,
                extraData: null
            };

            const form = component['buildForm'](mockProblem);

            expect(form.get('id')?.value).toBe('empty-test');
            expect(form.get('hypothesis')?.value).toBe('Empty test hypothesis');

            const premisesArray = form.get('premises') as FormArray;
            expect(premisesArray.length).toBe(0);

            const kbItemsArray = form.get('kbItems') as FormArray;
            expect(kbItemsArray.length).toBe(0);
        });

        it('should create form controls with required validators', () => {
            const mockProblem: Problem = {
                id: "validator-test",
                premises: ["Test premise"],
                hypothesis: "Test hypothesis",
                entailmentLabel: EntailmentLabel.CONTRADICTION,
                kbItems: [],
                dataset: Dataset.USER,
                extraData: null
            };

            const form = component['buildForm'](mockProblem);

            const hypothesisControl = form.get('hypothesis');
            expect(hypothesisControl?.hasError('required')).toBeFalsy();
            hypothesisControl?.setValue('');
            expect(hypothesisControl?.hasError('required')).toBeTruthy();
        });
    });

    describe('navigateToNewProblem', () => {
        it('should navigate when problem ID is different from current route', () => {
            const mockProblem: Problem = {
                id: "new-problem-id",
                premises: [],
                hypothesis: "",
                entailmentLabel: EntailmentLabel.UNKNOWN,
                kbItems: [],
                dataset: Dataset.USER,
                extraData: null
            };

            component['navigateToNewProblem'](mockProblem);

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/annotate', 'new-problem-id'],
                { queryParamsHandling: 'preserve' }
            );
        });

        it('should not navigate when problem ID matches current route', () => {
            const mockProblem: Problem = {
                id: "current-problem-id",
                premises: [],
                hypothesis: "",
                entailmentLabel: EntailmentLabel.UNKNOWN,
                kbItems: [],
                dataset: Dataset.USER,
                extraData: null
            };

            component['navigateToNewProblem'](mockProblem);

            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('should not navigate when problem is null', () => {
            // Call the private method with null
            component['navigateToNewProblem'](null);

            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
    });
});
