'use strict';

describe('options', () => {
    const { getOptions } = require('../lib/options');

	describe('getOptions', () => {
        const allArguments = [
            '--check',
        ];
        
        const defaults = {
            check: false,
        };
        
		it('should return defaults if no command-line arguments are given', () => {
            expect(getOptions()).toEqual(defaults);
        });
        
        it('should skip empty command-line argument (--)', () => {
            expect(getOptions(['--'])).toEqual(defaults);
        });
        
        allArguments.forEach((argument) => {
            it(`should successfully parse command-line argument: \`${argument}\``, () => {
                const option = argument.slice(2);

                expect(getOptions([argument])[option]).toEqual(true);
            });
        });
        
        it('should parse command-line argument with equals sign', () => {
            expect(getOptions(['--check=origin/master']).check).toEqual('origin/master');
        });
        
        it('should parse command-line argument with space before value', () => {
            expect(getOptions(['--check', 'origin/master']).check).toEqual('origin/master');
        });
	});
});
