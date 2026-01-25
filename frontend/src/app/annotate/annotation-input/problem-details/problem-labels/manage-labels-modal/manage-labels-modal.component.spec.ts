import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ManageLabelsModalComponent } from "./manage-labels-modal.component";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Label, LabelAnnotation } from "@/types";
import { ProblemService } from "@/services/problem.service";
import { AuthService } from "@/services/auth.service";
import { BehaviorSubject } from "rxjs";

describe("ManageLabelsModalComponent", () => {
    let component: ManageLabelsModalComponent;
    let fixture: ComponentFixture<ManageLabelsModalComponent>;
    let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
    let mockProblemService: jasmine.SpyObj<ProblemService>;
    let mockAuthService: jasmine.SpyObj<AuthService>;
    let allLabels$: BehaviorSubject<Label[]>;
    let currentUser$: BehaviorSubject<{ username: string; } | null>;

    // Test labels
    const testLabel1: Label = {
        id: 1,
        text: "Label 1",
        description: "First test label"
    };

    const testLabel2: Label = {
        id: 2,
        text: "Label 2",
        description: "Second test label"
    };

    const testLabel3: Label = {
        id: 3,
        text: "Label 3",
        description: "Third test label"
    };

    const testAttachedLabel: LabelAnnotation = {
        id: 999,
        label: testLabel1,
        createdAt: "2023-01-01T12:00:00Z",
        createdBy: "Other User",
        attachedByCurrentUser: false,
        removable: true,
        session: null,
        removedAt: null,
        removedBy: null,
        notes: '',
    };

    beforeEach(async () => {
        allLabels$ = new BehaviorSubject<Label[]>([testLabel1, testLabel2, testLabel3]);
        currentUser$ = new BehaviorSubject<{ username: string; } | null>({ username: "Current User" });

        mockActiveModal = jasmine.createSpyObj("NgbActiveModal", [
            "close",
            "dismiss",
        ]);

        mockProblemService = jasmine.createSpyObj("ProblemService", [], {
            allLabels$: allLabels$.asObservable()
        });

        mockAuthService = jasmine.createSpyObj("AuthService", [], {
            currentUser$: currentUser$.asObservable()
        });

        await TestBed.configureTestingModule({
            imports: [ManageLabelsModalComponent],
            providers: [
                { provide: NgbActiveModal, useValue: mockActiveModal },
                { provide: ProblemService, useValue: mockProblemService },
                { provide: AuthService, useValue: mockAuthService }
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ManageLabelsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should initialize form with default values", () => {
        expect(component.form.value).toEqual({
            problemId: -1,
            selectedLabelIds: [],
            remarks: ''
        });
    });

    it("should populate availableLabels$ with all labels initially", fakeAsync(() => {
        let availableLabels: Label[] = [];
        component.availableLabels$.subscribe(labels => {
            availableLabels = labels;
        });
        tick();

        expect(availableLabels.length).toBe(3);
        expect(availableLabels).toContain(testLabel1);
        expect(availableLabels).toContain(testLabel2);
        expect(availableLabels).toContain(testLabel3);
    }));

    it("should filter out selected labels from availableLabels$", fakeAsync(() => {
        component.form.controls.selectedLabelIds.setValue([1, 2]);
        tick();

        let availableLabels: Label[] = [];
        component.availableLabels$.subscribe(labels => {
            availableLabels = labels;
        });
        tick();

        expect(availableLabels.length).toBe(1);
        expect(availableLabels).toContain(testLabel3);
        expect(availableLabels).not.toContain(testLabel1);
        expect(availableLabels).not.toContain(testLabel2);
    }));

    it("should add label when addLabelAnnotation is called", fakeAsync(() => {
        component.addLabelAnnotation(testLabel1.id);
        tick();

        expect(component.form.controls.selectedLabelIds.value).toContain(testLabel1.id);
    }));

    it("should not add duplicate labels", fakeAsync(() => {
        component.form.controls.selectedLabelIds.setValue([testLabel1.id]);
        component.addLabelAnnotation(testLabel1.id);
        tick();

        expect(component.form.controls.selectedLabelIds.value).toEqual([testLabel1.id]);
    }));

    it("should remove label when removeLabel is called", () => {
        component.form.controls.selectedLabelIds.setValue([1, 2, 3]);
        component.removeLabel(2);

        expect(component.form.controls.selectedLabelIds.value).toEqual([1, 3]);
    });

    it("should create new LabelAnnotation objects for newly selected labels", fakeAsync(() => {
        component.currentAnnotations = [];
        component.form.controls.selectedLabelIds.setValue([testLabel1.id]);
        tick();

        let shownLabels: LabelAnnotation[] = [];
        component.shownLabels$.subscribe(labels => {
            shownLabels = labels;
        });
        tick();

        expect(shownLabels.length).toBe(1);
        expect(shownLabels[0].label).toEqual(testLabel1);
        expect(shownLabels[0].id).toBeNull();
        expect(shownLabels[0].attachedByCurrentUser).toBe(true);
        expect(shownLabels[0].createdBy).toBe("Current User");
    }));

    it("should preserve existing LabelAnnotation objects in shownLabels$", fakeAsync(() => {
        component.currentAnnotations = [testAttachedLabel];
        component.form.controls.selectedLabelIds.setValue([testLabel1.id]);
        tick();

        let shownLabels: LabelAnnotation[] = [];
        component.shownLabels$.subscribe(labels => {
            shownLabels = labels;
        });
        tick();

        expect(shownLabels.length).toBe(1);
        expect(shownLabels[0]).toBe(testAttachedLabel);
        expect(shownLabels[0].id).toBe(999);
        expect(shownLabels[0].createdBy).toBe("Other User");
    }));

    it("should close modal with transformed data", () => {
        component.form.controls.problemId.setValue(42);
        component.form.controls.selectedLabelIds.setValue([1, 2]);
        component.form.controls.remarks.setValue("Test remarks");

        component.closeModal();

        expect(mockActiveModal.close).toHaveBeenCalledWith({
            problemId: 42,
            selectedLabelIds: [1, 2],
            remarks: "Test remarks",
            selectedLabels: [{ id: 1 }, { id: 2 }]
        });
    });

    it("should format attachment text for current user", () => {
        const annotation: LabelAnnotation = {
            ...testAttachedLabel,
            attachedByCurrentUser: true,
            createdBy: "Current User",
            createdAt: "2024-03-15T10:30:00Z"
        };

        const text = component.getAttachedByText(annotation);

        expect(text).toContain("you");
        expect(text).toContain("15 March 2024");
    });

    it("should format attachment text for other user", () => {
        const annotation: LabelAnnotation = {
            ...testAttachedLabel,
            attachedByCurrentUser: false,
            createdBy: "Other User",
            createdAt: "2024-03-15T10:30:00Z"
        };

        const text = component.getAttachedByText(annotation);

        expect(text).toContain("Other User");
        expect(text).toContain("15 March 2024");
    });

    it("should handle unknown user when creating new annotations", fakeAsync(() => {
        currentUser$.next(null);
        component.currentAnnotations = [];
        component.form.controls.selectedLabelIds.setValue([testLabel1.id]);
        tick();

        let shownLabels: LabelAnnotation[] = [];
        component.shownLabels$.subscribe(labels => {
            shownLabels = labels;
        });
        tick();

        expect(shownLabels[0].createdBy).toBe("Unknown user");
    }));

    it("should set loadingLabels$ to false after labels are available", fakeAsync(() => {
        let loading = true;
        component.loadingLabels$.subscribe(isLoading => {
            loading = isLoading;
        });
        tick();

        expect(loading).toBe(false);
    }));

    it("should handle multiple labels being added and removed", fakeAsync(() => {
        component.addLabelAnnotation(testLabel1.id);
        tick();
        component.addLabelAnnotation(testLabel2.id);
        tick();

        expect(component.form.controls.selectedLabelIds.value).toEqual([testLabel1.id, testLabel2.id]);

        component.removeLabel(testLabel1.id);

        expect(component.form.controls.selectedLabelIds.value).toEqual([testLabel2.id]);
    }));

    it("should filter out null values from shownLabels$ when label not found", fakeAsync(() => {
        component.currentAnnotations = [];
        component.form.controls.selectedLabelIds.setValue([999]); // Non-existent label ID
        tick();

        let shownLabels: LabelAnnotation[] = [];
        component.shownLabels$.subscribe(labels => {
            shownLabels = labels;
        });
        tick();

        expect(shownLabels.length).toBe(0);
    }));
});
