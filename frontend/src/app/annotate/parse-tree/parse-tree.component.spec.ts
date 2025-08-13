import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseTree } from './parse-tree.component';

describe('ParseTree', () => {
  let component: ParseTree;
  let fixture: ComponentFixture<ParseTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParseTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParseTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
