import { SelectiveUpperCasePipe } from './selective-upper-case.pipe';

describe('SelectiveUpperCasePipe', () => {
    let pipe: SelectiveUpperCasePipe;

    beforeEach(() => {
        pipe = new SelectiveUpperCasePipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    describe('falsy values', () => {
        it('should return null for null input', () => {
            expect(pipe.transform(null as any)).toBeNull();
        });

        it('should return undefined for undefined input', () => {
            expect(pipe.transform(undefined as any)).toBeUndefined();
        });

        it('should return empty string for empty string input', () => {
            expect(pipe.transform('')).toBe('');
        });
    });

    describe('uppercase conversion', () => {
        it('should convert lowercase text to uppercase', () => {
            const result = pipe.transform('hello');
            expect(result).toBe('HELLO');
        });

        it('should handle text with special characters and numbers', () => {
            const result = pipe.transform('hello@world123');
            expect(result).toBe('HELLO@WORLD123');
        });
    });

    describe('whitelist handling', () => {
        it('should keep "period" in lowercase', () => {
            const result = pipe.transform('period');
            expect(result).toBe('period');
        });

        it('should convert "PERIOD" to lowercase', () => {
            const result = pipe.transform('PERIOD');
            expect(result).toBe('period');
        });
    });
});
