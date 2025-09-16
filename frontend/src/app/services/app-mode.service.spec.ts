import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { AppModeService, AppMode } from './app-mode.service';
import { ProblemService } from './problem.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AppModeService', () => {
    let service: AppModeService;
    let mockProblemService: jasmine.SpyObj<ProblemService>;
    let allParamsSubject: BehaviorSubject<any>;

    beforeEach(() => {
        allParamsSubject = new BehaviorSubject(null);

        const problemServiceSpy = jasmine.createSpyObj('ProblemService', [], {
            allParams$: allParamsSubject.asObservable()
        });

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: ProblemService, useValue: problemServiceSpy }
            ],
        });

        service = TestBed.inject(AppModeService);
        mockProblemService = TestBed.inject(ProblemService) as jasmine.SpyObj<ProblemService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('viewMode$', () => {
        it('should return BROWSE mode when problemId is set and edit is false', (done) => {
            const mockParams = {
                get: jasmine.createSpy('get').and.returnValue('123')
            };
            const allParams = {
                params: mockParams,
                queryParams: jasmine.createSpy(),
                edit: false
            };

            service.viewMode$.subscribe(mode => {
                expect(mode).toBe(AppMode.BROWSE);
                done();
            });

            allParamsSubject.next(allParams);
        });

        it('should return EDIT mode when problemId is set and edit is true', (done) => {
            const mockParams = {
                get: jasmine.createSpy('get').and.returnValue('123')
            };
            const allParams = {
                params: mockParams,
                queryParams: jasmine.createSpy(),
                edit: true
            };

            service.viewMode$.subscribe(mode => {
                expect(mode).toBe(AppMode.EDIT);
                done();
            });

            allParamsSubject.next(allParams);
        });

        it('should return ADD mode when problemId is "new"', (done) => {
            const mockParams = {
                get: jasmine.createSpy('get').and.returnValue('new')
            };
            const allParams = {
                params: mockParams,
                queryParams: jasmine.createSpy(),
                edit: false
            };

            service.viewMode$.subscribe(mode => {
                expect(mode).toBe(AppMode.ADD);
                done();
            });

            allParamsSubject.next(allParams);
        });

        it('should not emit when allParams is null', () => {
            const emittedValues: AppMode[] = [];

            service.viewMode$.subscribe(mode => {
                emittedValues.push(mode);
            });

            allParamsSubject.next(null);

            expect(emittedValues.length).toEqual(0);
        });
    });

    describe('loading$', () => {
        it('should emit true when viewMode is undefined', (done) => {
            const mockParams = {
                get: jasmine.createSpy('get').and.returnValue('123')
            };
            const allParams = {
                params: mockParams,
                queryParams: jasmine.createSpy(),
                edit: false
            };

            service.loading$.subscribe(loading => {
                expect(loading).toBe(false);
                done();
            });

            allParamsSubject.next(allParams);
        });

        it('should emit false when viewMode is defined', (done) => {
            const mockParams = {
                get: jasmine.createSpy('get').and.returnValue('edit-123')
            };
            const allParams = {
                params: mockParams,
                queryParams: jasmine.createSpy(),
                edit: true
            };

            service.loading$.subscribe(loading => {
                expect(loading).toBe(false);
                done();
            });

            allParamsSubject.next(allParams);
        });
    });
});
