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
                    get: jasmine.createSpy('get').and.returnValue("17")
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
                id: 123,
                base: null,
                premises: ["First premise", "Second premise"],
                hypothesis: "Test hypothesis",
                entailmentLabel: EntailmentLabel.ENTAILMENT,
                kbItems: [
                    {
                        id: 456,
                        entity1: "cat",
                        entity2: "animal",
                        relationship: KnowledgeBaseRelationship.SUBSET
                    },
                    {
                        id: 789,
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
            expect(form.get('id')?.value).toBe(123);
            expect(form.get('hypothesis')?.value).toBe('Test hypothesis');

            // Test premises array
            const premisesArray = form.controls.premises;
            expect(premisesArray.length).toBe(2);
            expect(premisesArray.controls[0].value).toBe('First premise');
            expect(premisesArray.controls[1].value).toBe('Second premise');

            // Test knowledge base items
            const kbItemsArray = form.controls.kbItems;
            expect(kbItemsArray.length).toBe(2);

            const firstKbForm = kbItemsArray.controls[0];
            expect(firstKbForm.value.id).toBe(456);
            expect(firstKbForm.value.entity1).toBe('cat');
            expect(firstKbForm.value.entity2).toBe('animal');
            expect(firstKbForm.value.relationship).toBe(KnowledgeBaseRelationship.SUBSET);

            const secondKbForm = kbItemsArray.controls[1];
            expect(secondKbForm.value.id).toBe(789);
            expect(secondKbForm.value.entity1).toBe('dog');
            expect(secondKbForm.value.entity2).toBe('pet');
            expect(secondKbForm.value.relationship).toBe(KnowledgeBaseRelationship.EQUAL);
        });

        it('should handle empty premises and kbItems arrays', () => {
            const mockProblem: Problem = {
                id: 123,
                base: null,
                premises: [],
                hypothesis: "Empty test hypothesis",
                entailmentLabel: EntailmentLabel.NEUTRAL,
                kbItems: [],
                dataset: Dataset.USER,
                extraData: null
            };

            const form = component['buildForm'](mockProblem);

            expect(form.get('id')?.value).toBe(123);
            expect(form.get('hypothesis')?.value).toBe('Empty test hypothesis');

            const premisesArray = form.get('premises') as FormArray;
            expect(premisesArray.length).toBe(0);

            const kbItemsArray = form.get('kbItems') as FormArray;
            expect(kbItemsArray.length).toBe(0);
        });

        it('should create form controls with required validators', () => {
            const mockProblem: Problem = {
                id: 1,
                base: null,
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
                id: 12,
                base: null,
                premises: [],
                hypothesis: "",
                entailmentLabel: EntailmentLabel.UNKNOWN,
                kbItems: [],
                dataset: Dataset.USER,
                extraData: null
            };

            component['navigateToNewProblem'](mockProblem);

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/annotate', 12],
                { queryParamsHandling: 'preserve' }
            );
        });

        it('should not navigate when problem ID matches current route', () => {
            const mockProblem: Problem = {
                id: 17,
                base: null,
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
