import { SubscriptPipe } from './subscript-pipe';

describe('SubscriptPipe', () => {
    let pipe: SubscriptPipe;

    beforeEach(() => {
        pipe = new SubscriptPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    describe('nullish values', () => {
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

    describe('single matches', () => {
        it('should convert text after colon and before backslash to subscript', () => {
            const result = pipe.transform('np:dcl\\nb');
            expect(result).toBe('np<sub>dcl</sub>\\nb');
        });

        it('should convert text after colon and before forward slash to subscript', () => {
            const result = pipe.transform('np:dcl/nb');
            expect(result).toBe('np<sub>dcl</sub>/nb');
        });

        it('should convert text after colon at end of string to subscript', () => {
            const result = pipe.transform('s:ng');
            expect(result).toBe('s<sub>ng</sub>');
        });

        it('should convert text after colon and before opening parenthesis to subscript', () => {
            const result = pipe.transform('np:nb(test)');
            expect(result).toBe('np<sub>nb</sub>(test)');
        });

        it('should convert text after colon and before closing parenthesis to subscript', () => {
            const result = pipe.transform('test:value)more');
            expect(result).toBe('test<sub>value</sub>)more');
        });

        it('should convert text after colon and before hyphen to subscript', () => {
            const result = pipe.transform('np:nb-s:dcl');
            expect(result).toBe('np<sub>nb</sub>-s<sub>dcl</sub>');
        });
    });

    describe('multiple matches', () => {
        it('should handle multiple colon patterns in one string', () => {
            const result = pipe.transform('np:nb-s:dcl');
            expect(result).toBe('np<sub>nb</sub>-s<sub>dcl</sub>');
        });

        it('should handle multiple colon patterns with different terminators', () => {
            const result = pipe.transform('(np:nb-s:dcl)-s:dcl');
            expect(result).toBe('(np<sub>nb</sub>-s<sub>dcl</sub>)-s<sub>dcl</sub>');
        });
    });

    describe('case conversion', () => {
        it('should lowercase text after the colon', () => {
            const result = pipe.transform('NP:DCL');
            expect(result).toBe('NP<sub>dcl</sub>');
        });

        it('should preserve case of text before colon', () => {
            const result = pipe.transform('NP:dcl');
            expect(result).toBe('NP<sub>dcl</sub>');
        });

        it('should preserve case of text after terminator', () => {
            const result = pipe.transform('np:dcl\\NB');
            expect(result).toBe('np<sub>dcl</sub>\\NB');
        });
    });

    describe('edge cases', () => {
        it('should handle string with no colon', () => {
            const result = pipe.transform('nocontent');
            expect(result).toBe('nocontent');
        });

        it('should handle special characters in subscript content', () => {
            const result = pipe.transform('test:a@b#c');
            expect(result).toBe('test<sub>a@b#c</sub>');
        });
    });
});
