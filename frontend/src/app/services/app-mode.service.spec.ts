import { TestBed } from '@angular/core/testing';

import { AppModeService } from './app-mode.service';

describe('AppModeService', () => {
  let service: AppModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
