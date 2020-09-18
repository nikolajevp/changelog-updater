'use strict';

/* eslint-disable no-unused-vars */
/* eslint-disable no-global-assign */
describe('changelog-updater', () => {
	const fs = require('fs');
	
	const fixturesPath = `${__dirname}/fixtures`;
	const fixtures = fs.readdirSync(fixturesPath)
		.reduce((allFixtures, filename) => {
			allFixtures[filename] = fs.readFileSync(`${fixturesPath}/${filename}`, { encoding: 'utf8' });
			
			return allFixtures;
		}, {});
	
	const constantDate = new Date('2020-09-18T12:00:00');
	const changelogFilename = 'CHANGELOG.md';
	const noChangesMessage = `No changes under [Unreleased] in ${changelogFilename}`;
	
	let main = () => {};

	let readFileSyncMock;
	let writeFileSyncMock;
	let exitMock;
	
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
		
		readFileSyncMock = jest.spyOn(fs, 'readFileSync');
		writeFileSyncMock = jest.spyOn(fs, 'writeFileSync');
		exitMock = jest.spyOn(process, 'exit');

		main = require('../lib/index').main;
	});

	describe('default: update changelog', () => {
		it('should throw error if not possible to read changelog', () => {
			readFileSyncMock.mockImplementation(() => {
				throw new Error('Could not read file');
			});
			writeFileSyncMock.mockImplementation(() => {});

			expect(main).toThrow('Could not read file');
		});
	
		it('should throw error if not possible to write changelog', () => {
			readFileSyncMock.mockImplementation(() => fixtures['github.before.md']);
			writeFileSyncMock.mockImplementation(() => {
				throw new Error('Could not write file');
			});

			expect(main).toThrow('Could not write file');
		});
		
		it('should update [Unreleased] section for Github', () => {
			readFileSyncMock.mockImplementation(() => fixtures['github.before.md']);
			writeFileSyncMock.mockImplementation(() => {});

			main();

			expect(writeFileSyncMock.mock.calls[0][1]).toEqual(
				fixtures['github.after.md']
			);
		});
	
		it('should update [Unreleased] section for Bitbucket', () => {
			readFileSyncMock.mockImplementation(() => fixtures['bitbucket.before.md']);
			writeFileSyncMock.mockImplementation(() => {});

			main();

			expect(writeFileSyncMock.mock.calls[0][1]).toEqual(
				fixtures['bitbucket.after.md']
			);
		});
	});

	describe('--check', () => {
		it('should exit normally if using `--check` and [Unreleased] section is filled', () => {
			readFileSyncMock.mockImplementation(
				() => fixtures['github.before.md']
			);
			writeFileSyncMock.mockImplementation(() => {});

			main(['--check']);

			expect(exitMock.mock.calls[0][0]).toEqual(0);
		});

		it('should throw if using `--check` and [Unreleased] section is empty', () => {
			readFileSyncMock.mockImplementation(
				() => fixtures['empty.unreleased.md']
			);
			writeFileSyncMock.mockImplementation(() => {});

			expect(() => main(['--check'])).toThrow(
				noChangesMessage
			);
		});
	});
});
