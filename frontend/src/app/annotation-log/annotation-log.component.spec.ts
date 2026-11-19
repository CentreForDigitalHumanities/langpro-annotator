import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationLogComponent } from './annotation-log.component';

describe('AnnotationLogComponent', () => {
  let component: AnnotationLogComponent;
  let fixture: ComponentFixture<AnnotationLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotationLogComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AnnotationLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
