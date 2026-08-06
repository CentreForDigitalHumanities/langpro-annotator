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
            expect(pipe.transform(null as any, "CCG Tree")).toBeNull();
        });

        it('should return undefined for undefined input', () => {
            expect(pipe.transform(undefined as any, "CCG Tree")).toBeUndefined();
        });

        it('should return empty string for empty string input', () => {
            expect(pipe.transform('', "CCG Tree")).toBe('');
        });
    });

    describe('uppercase conversion', () => {
        it('should convert lowercase text to uppercase', () => {
            const result = pipe.transform('hello', "CCG Tree");
            expect(result).toBe('HELLO');
        });

        it('should handle text with special characters and numbers', () => {
            const result = pipe.transform('hello@world123', "CCG Tree");
            expect(result).toBe('HELLO@WORLD123');
        });
    });

    describe('whitelist and non-CCG Tree handling', () => {
        it('should keep "period" in lowercase', () => {
            const result = pipe.transform('period', "CCG Tree");
            expect(result).toBe('period');
        });

        it('should convert "PERIOD" to lowercase', () => {
            const result = pipe.transform('PERIOD', "CCG Tree");
            expect(result).toBe('period');
        });

        it('should not convert text for non-CCG Tree types', () => {
            const result = pipe.transform('hello', "CCG Term");
            expect(result).toBe('hello');
        });
    });
});
