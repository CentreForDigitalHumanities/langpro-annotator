import { TestBed } from '@angular/core/testing';

import { ProblemService } from './problem.service';
import { provideHttpClient } from '@angular/common/http';

describe('ProblemService', () => {
    let service: ProblemService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient()]
        });
        service = TestBed.inject(ProblemService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
