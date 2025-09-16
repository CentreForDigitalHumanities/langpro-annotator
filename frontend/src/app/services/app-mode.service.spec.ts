import { TestBed } from '@angular/core/testing';

import { AppModeService } from './app-mode.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AppModeService', () => {
    let service: AppModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(AppModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
