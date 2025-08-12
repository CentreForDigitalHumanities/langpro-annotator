import { TestBed } from '@angular/core/testing';

import { ParseService } from './parse.service';
import { provideHttpClient } from '@angular/common/http';

describe('ParseService', () => {
    let service: ParseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient()]
        });
        service = TestBed.inject(ParseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
