'use strict';

/* eslint-disable no-unused-vars */
/* eslint-disable no-global-assign */
describe('changelog-updater', () => {
	const fs = require('fs');

	const fixturesPath = `${__dirname}/fixtures`;
	const fixtures = fs
		.readdirSync(fixturesPath)
		.reduce((allFixtures, filename) => {
			allFixtures[filename] = fs.readFileSync(
				`${fixturesPath}/${filename}`,
				{
					encoding: 'utf8',
				}
			);

			return allFixtures;
		}, {});

	const constantDate = new Date('2020-09-18T12:00:00');
	const changelogFilename = 'CHANGELOG.md';
	const noChangesMessage = `No changes detected under [Unreleased] in ${changelogFilename}!\nPlease use ### headings. See: https://keepachangelog.com`;

	let main = () => {};

	let readFileSyncMock;
	let writeFileSyncMock;

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
			readFileSyncMock.mockImplementation(
				() => fixtures['github.before.md']
			);
			writeFileSyncMock.mockImplementation(() => {
				throw new Error('Could not write file');
			});

			expect(main).toThrow('Could not write file');
		});

		it('should update [Unreleased] section for Github', () => {
			readFileSyncMock.mockImplementation(
				() => fixtures['github.before.md']
			);
			writeFileSyncMock.mockImplementation(() => {});

			main();

			expect(writeFileSyncMock.mock.calls[0][1]).toEqual(
				fixtures['github.after.md']
			);
		});

		it('should update [Unreleased] section for Bitbucket', () => {
			readFileSyncMock.mockImplementation(
				() => fixtures['bitbucket.before.md']
			);
			writeFileSyncMock.mockImplementation(() => {});

			main();

			expect(writeFileSyncMock.mock.calls[0][1]).toEqual(
				fixtures['bitbucket.after.md']
			);
		});
	});

	describe('--init', () => {
		[
			{ type: 'github', form: 'short' },
			{ type: 'github', form: 'https' },
			{ type: 'github', form: 'ssh' },
			{ type: 'github', form: 'git' },
			{ type: 'github', form: 'git+https' },
			{ type: 'github', form: 'nosuffix' },
			{ type: 'github', form: 'noscheme' },
			{ type: 'bitbucket', form: 'short' },
			{ type: 'bitbucket', form: 'https' },
			{ type: 'bitbucket', form: 'ssh' },
			{ type: 'bitbucket', form: 'git' },
			{ type: 'bitbucket', form: 'git+https' },
			{ type: 'bitbucket', form: 'nosuffix' },
			{ type: 'bitbucket', form: 'noscheme' },
		].forEach((testCase) => {
			it(`should create a new changelog for \`${testCase.type}\` (${testCase.form} \`repository\`)`, () => {
				readFileSyncMock
					.mockImplementationOnce(() => fixtures['init.default.md'])
					.mockImplementationOnce(
						() =>
							fixtures[
								`package.${testCase.type}.${testCase.form}.json`
							]
					);
				writeFileSyncMock.mockImplementation(() => {});

				main(['--init']);

				const args = writeFileSyncMock.mock.calls[0];

				expect(args[0]).toEqual(changelogFilename);
				expect(args[1]).toEqual(fixtures[`init.${testCase.type}.md`]);
				expect(args[2]).toEqual({ encoding: 'utf8', flag: 'wx' });
			});
		});

		it('should throw if `repository` is invalid', () => {
			readFileSyncMock
				.mockImplementationOnce(() => fixtures['init.default.md'])
				.mockImplementationOnce(
					() => fixtures['package.repository.invalid.json']
				);
			writeFileSyncMock.mockImplementation(() => {});

			expect(() => main(['--init'])).toThrow();
		});

		it('should throw if `repository` is missing', () => {
			readFileSyncMock
				.mockImplementationOnce(() => fixtures['init.default.md'])
				.mockImplementationOnce(
					() => fixtures['package.repository.missing.json']
				);
			writeFileSyncMock.mockImplementation(() => {});

			expect(() => main(['--init'])).toThrow();
		});

		it('should throw if `version` is missing', () => {
			readFileSyncMock
				.mockImplementationOnce(() => fixtures['init.default.md'])
				.mockImplementationOnce(
					() => fixtures['package.version.missing.json']
				);
			writeFileSyncMock.mockImplementation(() => {});

			expect(() => main(['--init'])).toThrow();
		});

		it('should throw if changelog already exists', () => {
			readFileSyncMock.mockImplementation(() => {});
			writeFileSyncMock.mockImplementation(() => {
				throw new Error('Could not write file');
			});

			expect(() => main(['--init'])).toThrow();
		});
	});

	describe('--check', () => {
		it('should exit normally if using `--check` and [Unreleased] section is filled', () => {
			readFileSyncMock.mockImplementation(
				() => fixtures['github.before.md']
			);
			writeFileSyncMock.mockImplementation(() => {});

			main(['--check']);

			expect(writeFileSyncMock).not.toBeCalled();
		});

		it('should throw if using `--check` and [Unreleased] section is empty', () => {
			readFileSyncMock.mockImplementation(
				() => fixtures['empty.unreleased.md']
			);
			writeFileSyncMock.mockImplementation(() => {});

			expect(() => main(['--check'])).toThrow(noChangesMessage);
		});
	});
});
