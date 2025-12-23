import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ManageLabelsModalComponent } from "./manage-labels-modal.component";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ProblemLabel, Label } from "@/types";
import { ProblemService } from "@/services/problem.service";
import { AuthService } from "@/services/auth.service";
import { of } from "rxjs";

describe("ManageLabelsModalComponent", () => {
    let component: ManageLabelsModalComponent;
    let fixture: ComponentFixture<ManageLabelsModalComponent>;
    let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
    let mockProblemService: jasmine.SpyObj<ProblemService>;
    let mockAuthService: jasmine.SpyObj<AuthService>;

    // Test labels
    const testAvailableLabel: Label = {
        id: 998,
        text: "Test Available Label",
        description: "A label that can be added"
    };

    const testAttachedLabel: ProblemLabel = {
        id: 999,
        text: "Test Attached Label",
        description: "A label that is already attached",
        attachedInfo: {
            userName: "Test User",
            date: "2023-01-01",
            attachedByCurrentUser: false
        },
        removable: true
    };

    beforeEach(async () => {
        mockActiveModal = jasmine.createSpyObj("NgbActiveModal", [
            "close",
            "dismiss",
        ]);

        mockProblemService = jasmine.createSpyObj("ProblemService", [], {
            allLabels$: of([testAvailableLabel])
        });

        mockAuthService = jasmine.createSpyObj("AuthService", [], {
            currentUser$: of({ username: "Current User" })
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


    it("should initialize with empty selected labels", () => {
        expect(component.form.controls.selectedLabels.value).toEqual([]);
    });


    describe("addLabel", () => {
        it("should add a label to selected list", fakeAsync(() => {
            const initialLength = component.form.controls.selectedLabels.value.length;

            component.addLabel(testAvailableLabel.id);
            tick();

            expect(component.form.controls.selectedLabels.value.length).toBe(initialLength + 1);
            expect(component.form.controls.selectedLabels.value.some(l => l.id === testAvailableLabel.id)).toBe(true);
        }));

        it("should set attachedInfo when adding a label", fakeAsync(() => {
            component.addLabel(testAvailableLabel.id);
            tick();

            const addedLabel = component.form.controls.selectedLabels.value.find(l => l.id === testAvailableLabel.id);

            expect(addedLabel?.attachedInfo).toBeDefined();
            expect(addedLabel?.attachedInfo?.userName).toBe('Current User');
            expect(addedLabel?.attachedInfo?.attachedByCurrentUser).toBe(true);
        }));

        it("should set removable to true when adding a label", fakeAsync(() => {
            component.addLabel(testAvailableLabel.id);
            tick();

            const addedLabel = component.form.controls.selectedLabels.value.find(l => l.id === testAvailableLabel.id);

            expect(addedLabel?.removable).toBe(true);
        }));

        it("should not add a label if id is not found", fakeAsync(() => {
            const initialLength = component.form.controls.selectedLabels.value.length;
            component.addLabel(99999);
            tick();
            expect(component.form.controls.selectedLabels.value.length).toBe(initialLength);
        }));
    });

    describe("removeLabel", () => {
        it("should remove a label from selected list", fakeAsync(() => {
            component.addLabel(testAvailableLabel.id);
            tick();
            const lengthAfterAdd = component.form.controls.selectedLabels.value.length;

            component.removeLabel(testAvailableLabel.id);
            tick();

            expect(component.form.controls.selectedLabels.value.length).toBe(lengthAfterAdd - 1);
            expect(component.form.controls.selectedLabels.value.some(l => l.id === testAvailableLabel.id)).toBe(false);
        }));

        it("should not fail if trying to remove a non-existent label", fakeAsync(() => {
            const initialLength = component.form.controls.selectedLabels.value.length;
            component.removeLabel(99999);
            tick();
            expect(component.form.controls.selectedLabels.value.length).toBe(initialLength);
        }));
    });

    describe("getAttachedByText", () => {
        it("should return empty string for a label without attachedInfo", () => {
            const label: ProblemLabel = {
                ...testAvailableLabel,
                attachedInfo: null,
                removable: false
            };
            expect(component.getAttachedByText(label)).toBe("");
        });

        it("should return formatted text for a label attached by current user", () => {
            const label: ProblemLabel = {
                ...testAvailableLabel,
                attachedInfo: {
                    userName: "John Doe",
                    date: "2023-01-01",
                    attachedByCurrentUser: true,
                },
                removable: true
            };
            const result = component.getAttachedByText(label);
            expect(result).toContain("you");
            expect(result).toContain("January");
        });

        it("should return formatted text for a label attached by other user", () => {
            const label: ProblemLabel = {
                ...testAttachedLabel,
                attachedInfo: {
                    userName: "John Doe",
                    date: "2023-01-01",
                    attachedByCurrentUser: false,
                },
            };
            const result = component.getAttachedByText(label);
            expect(result).not.toContain("you");
            expect(result).toContain("John Doe");
            expect(result).toContain("January");
        });
    });

    describe("availableLabels observable", () => {
        it("should filter out selected labels from available labels", (done) => {
            component.availableLabels$.subscribe(available => {
                const selectedIds = component.form.controls.selectedLabels.value.map((l: ProblemLabel) => l.id);

                available.forEach(label => {
                    expect(selectedIds.includes(label.id)).toBe(false);
                });
                done();
            });
        });

        it("should update when a label is added", fakeAsync(() => {
            let availableCount = 0;
            component.availableLabels$.subscribe(labels => {
                availableCount = labels.length;
            });
            tick();

            const initialCount = availableCount;

            component.addLabel(testAvailableLabel.id);
            tick();

            expect(availableCount).toBe(initialCount - 1);
        }));

        it("should update when a label is removed", fakeAsync(() => {
            component.addLabel(testAvailableLabel.id);
            tick();

            let availableCount = 0;
            component.availableLabels$.subscribe(labels => {
                availableCount = labels.length;
            });
            tick();

            const countAfterAdd = availableCount;

            component.removeLabel(testAvailableLabel.id);
            tick();

            expect(availableCount).toBe(countAfterAdd + 1);
        }));
    });
});
