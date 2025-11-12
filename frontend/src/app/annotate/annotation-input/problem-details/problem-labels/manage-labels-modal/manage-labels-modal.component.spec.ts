import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ManageLabelsModalComponent } from "./manage-labels-modal.component";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ProblemLabel } from "../../problem-details.component";

describe("ManageLabelsModalComponent", () => {
    let component: ManageLabelsModalComponent;
    let fixture: ComponentFixture<ManageLabelsModalComponent>;
    let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

    // Test labels
    const testAvailableLabel: ProblemLabel = {
        id: 998,
        text: "Test Available Label",
        description: "A label that can be added",
        attachedInfo: null,
        removable: false
    };

    const testAttachedLabel: ProblemLabel = {
        id: 999,
        text: "Test Attached Label",
        description: "A label that is already attached",
        attachedInfo: {
            userName: "Test User",
            date: new Date("2023-01-01"),
            currentUser: false
        },
        removable: true
    };

    beforeEach(async () => {
        mockActiveModal = jasmine.createSpyObj("NgbActiveModal", [
            "close",
            "dismiss",
        ]);

        await TestBed.configureTestingModule({
            imports: [ManageLabelsModalComponent],
            providers: [{ provide: NgbActiveModal, useValue: mockActiveModal }],
        }).compileComponents();

        fixture = TestBed.createComponent(ManageLabelsModalComponent);
        component = fixture.componentInstance;

        // Add test labels to component's allLabels
        component.allLabels = [...component.allLabels, testAvailableLabel, testAttachedLabel];

        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("initialization", () => {
        it("should initialize with empty selected labels", () => {
            expect(component.selected()).toEqual([]);
        });

        it("should initialize availableLabels computed signal", () => {
            expect(component.availableLabels()).toBeDefined();
        });
    });

    describe("addLabel", () => {
        it("should add a label to selected list", () => {
            const initialLength = component.selected().length;

            component.addLabel(testAvailableLabel.id);
            expect(component.selected().length).toBe(initialLength + 1);
            expect(component.selected().some(l => l.id === testAvailableLabel.id)).toBe(true);
        });

        it("should set attachedInfo when adding a label", () => {
            component.addLabel(testAvailableLabel.id);
            const addedLabel = component.selected().find(l => l.id === testAvailableLabel.id);

            expect(addedLabel?.attachedInfo).toBeDefined();
            expect(addedLabel?.attachedInfo?.userName).toBe('Current User');
            expect(addedLabel?.attachedInfo?.currentUser).toBe(true);
        });

        it("should set removable to true when adding a label", () => {
            component.addLabel(testAvailableLabel.id);
            const addedLabel = component.selected().find(l => l.id === testAvailableLabel.id);

            expect(addedLabel?.removable).toBe(true);
        });

        it("should not add a label if id is not found", () => {
            const initialLength = component.selected().length;
            component.addLabel(99999);
            expect(component.selected().length).toBe(initialLength);
        });

        it("should remove label from availableLabels when added", () => {
            component.allLabels = [...component.allLabels, testAvailableLabel, testAttachedLabel];
            const wasAvailable = component.availableLabels().some(l => l.id === testAvailableLabel.id);
            expect(wasAvailable).toBe(true);

            component.addLabel(testAvailableLabel.id);

            const isStillAvailable = component.availableLabels().some(l => l.id === testAvailableLabel.id);
            expect(isStillAvailable).toBe(false);
        });
    });

    describe("removeLabel", () => {
        it("should remove a label from selected list", () => {
            component.addLabel(testAvailableLabel.id);
            const lengthAfterAdd = component.selected().length;

            component.removeLabel(testAvailableLabel.id);
            expect(component.selected().length).toBe(lengthAfterAdd - 1);
            expect(component.selected().some(l => l.id === testAvailableLabel.id)).toBe(false);
        });

        it("should set attachedInfo to null when removing a label", () => {
            component.addLabel(testAvailableLabel.id);
            component.removeLabel(testAvailableLabel.id);

            const labelInAllLabels = component.allLabels.find(l => l.id === testAvailableLabel.id);
            expect(labelInAllLabels?.attachedInfo).toBeNull();
        });

        it("should not fail if trying to remove non-existent label", () => {
            const initialLength = component.selected().length;
            component.removeLabel(99999);
            expect(component.selected().length).toBe(initialLength);
        });

        it("should add label back to availableLabels when removed", () => {
            component.addLabel(testAvailableLabel.id);
            component.removeLabel(testAvailableLabel.id);

            const isAvailable = component.availableLabels().some(l => l.id === testAvailableLabel.id);
            expect(isAvailable).toBe(true);
        });
    });

    describe("closeModal", () => {
        it("should close modal and emit selected labels by default", () => {
            component.closeModal();
            expect(mockActiveModal.close).toHaveBeenCalled();
        });

        it("should emit labelsChanged output when saving", (done) => {
            const subscription = component.labelsChanged.subscribe((labels: ProblemLabel[]) => {
                expect(labels).toEqual(component.selected());
                subscription.unsubscribe();
                done();
            });

            component.closeModal();
        });

        it("should dismiss modal without emitting when save is false", () => {
            component.closeModal({ save: false });
            expect(mockActiveModal.dismiss).toHaveBeenCalled();
            expect(mockActiveModal.close).not.toHaveBeenCalled();
        });

        it("should not emit labelsChanged when save is false", (done) => {
            let emitted = false;
            const subscription = component.labelsChanged.subscribe(() => {
                emitted = true;
            });

            component.closeModal({ save: false });

            setTimeout(() => {
                expect(emitted).toBe(false);
                subscription.unsubscribe();
                done();
            }, 100);
        });
    });

    describe("getAttachedByText", () => {
        it("should return empty string for label without attachedInfo", () => {
            const label = testAvailableLabel;
            label.attachedInfo = null;
            expect(component.getAttachedByText(label)).toBe("");
        });

        it("should return formatted text for label attached by current user", () => {
            const label = testAvailableLabel;
            label.attachedInfo = {
                userName: "John Doe",
                date: new Date("2023-01-01"),
                currentUser: true,
            };
            const result = component.getAttachedByText(label);
            expect(result).toContain("you");
            expect(result).toContain("January");
        });

        it("should return formatted text for label attached by other user", () => {
            const label = testAttachedLabel;
            label.attachedInfo = {
                userName: "John Doe",
                date: new Date("2023-01-01"),
                currentUser: false,
            };
            const result = component.getAttachedByText(label);
            expect(result).not.toContain("you");
            expect(result).toContain("John Doe");
            expect(result).toContain("January");
        });
    });

    describe("availableLabels computed", () => {
        it("should only show labels that are not in selected", () => {
            const available = component.availableLabels();
            const selectedIds = component.selected().map(l => l.id);

            available.forEach(label => {
                expect(selectedIds.includes(label.id)).toBe(false);
            });
        });

        it("should update when a label is added", () => {
            const labelToAdd = component.availableLabels()[0];
            const initialCount = component.availableLabels().length;

            component.addLabel(labelToAdd.id);

            expect(component.availableLabels().length).toBe(initialCount - 1);
        });

        it("should update when a label is removed", () => {
            const labelToAdd = component.availableLabels()[0];
            component.addLabel(labelToAdd.id);
            const countAfterAdd = component.availableLabels().length;

            component.removeLabel(labelToAdd.id);

            expect(component.availableLabels().length).toBe(countAfterAdd + 1);
        });
    });
});
