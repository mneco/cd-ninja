import { sanitize } from 'sanitize-filename-ts';

describe('Test', () => {
	it('stub', () => {
		expect(true).toBeTruthy();
	});

	it('sanitize', () => {
		expect(sanitize('tg-sample/../')).toBe('tg-sample');
	});
});
