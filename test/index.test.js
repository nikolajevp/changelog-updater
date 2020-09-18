'use strict';

/* eslint-disable no-unused-vars */
/* eslint-disable no-global-assign */
describe('updateChangelog', () => {
	const fs = require('fs');
	
	const fixturesPath = `${__dirname}/fixtures`;
	const fixtures = fs.readdirSync(fixturesPath)
		.reduce((allFixtures, filename) => {
			allFixtures[filename] = fs.readFileSync(`${fixturesPath}/${filename}`, { encoding: 'utf8' });
			
			return allFixtures;
		}, {});
	
	const constantDate = new Date('2020-09-18T12:00:00');
	
	let updateChangelog = () => {};
			
	let readFileSync;
	let writeFileSync;
	
	let _Date;
	let _npmPackageVersion;

	beforeAll(() => {
		_Date = Date;
		Date = class extends Date {
			constructor() {
				return constantDate;
			}
		};
		
		_npmPackageVersion = process.env.npm_package_version;
		process.env.npm_package_version = '1.0.0';
	});
	
	afterAll(() => {
		Date = _Date;
		process.env.npm_package_version = _npmPackageVersion;
	});

	beforeEach(() => {
		jest.resetAllMocks();
		
		readFileSync = jest.spyOn(fs, 'readFileSync');
		writeFileSync = jest.spyOn(fs, 'writeFileSync');
		
		updateChangelog = require('../lib/index').updateChangelog;
	});

	it('should throw error if not possible to read changelog', () => {
		readFileSync.mockImplementation(() => {
			throw new Error('Could not read file');
		});
		
		expect(updateChangelog).toThrow('Could not read file');
	});

	it('should throw error if not possible to write changelog', () => {
		readFileSync.mockImplementation(() => 'anything');
		writeFileSync.mockImplementation(() => {
			throw new Error('Could not write file');
		});

		expect(updateChangelog).toThrow('Could not write file');
	});

	it('should update [Unreleased] section for Github', () => {
		readFileSync.mockImplementation(() => fixtures['github.before.md']);
		writeFileSync.mockImplementation(() => {});

		updateChangelog();

		expect(writeFileSync.mock.calls[0][1]).toEqual(fixtures['github.after.md']);
	});

	it('should update [Unreleased] section for Bitbucket', () => {
		readFileSync.mockImplementation(() => fixtures['bitbucket.before.md']);
		writeFileSync.mockImplementation(() => {});

		updateChangelog();

		expect(writeFileSync.mock.calls[0][1]).toEqual(fixtures['bitbucket.after.md']);
	});
});
