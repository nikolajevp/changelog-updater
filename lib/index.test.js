describe('updateChangelog', () => {
	const constantDate = new Date('2017-12-12T10:20:30');
	let readFile, writeFile, npmPackageVersion, fs, updateChangelog, _Date;

	beforeAll(() => {
		_Date = Date;
		Date = class extends Date {
			constructor() {
				return constantDate;
			}
		};
		npmPackageVersion = process.env.npm_package_version;
		process.env.npm_package_version = '1.0.0';
		fs = require('fs');
		updateChangelog = require('./index');
	});

	beforeEach(() => {
		readFile = jest.spyOn(fs, 'readFile').mockImplementation(() => {});
		writeFile = jest.spyOn(fs, 'writeFile').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	afterAll(() => {
		Date = _Date;
		process.env.npm_package_version = npmPackageVersion;
	});

	it('throws error if not possible to read changelog', () => {
		readFile
			.mockClear()
			.mockImplementation((changelogFileName, format, callback) =>
				callback(Error('could not read file'))
			);

		expect(updateChangelog).toThrow('could not read file');
	});

	it('throws error if not possible to save changelog', () => {
		readFile
			.mockClear()
			.mockImplementation((changelogFileName, format, callback) =>
				callback(null, ``)
			);

		writeFile
			.mockClear()
			.mockImplementation(
				(changelogFileName, changelog, format, callback) => {
					return callback(Error('could not write file'));
				}
			);

		expect(updateChangelog).toThrow('could not write file');
	});

	it('Updates [Unreleased] section', () => {
		readFile
			.mockClear()
			.mockImplementation((changelogFileName, format, callback) =>
				callback(
					null,
					`
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.1.0 - 2017-12-09
### Added
- Initial commit

[Unreleased]: https://github.com/nikolajevp/changelog-updater/compare/v0.1.0...HEAD
			`
				)
			);

		writeFile
			.mockClear()
			.mockImplementation(
				(changelogFileName, changelog, format, callback) => {
					return callback();
				}
			);

		updateChangelog();

		expect(writeFile.mock.calls[0][1]).toEqual(`
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2017-12-12

## 0.1.0 - 2017-12-09
### Added
- Initial commit

[Unreleased]: https://github.com/nikolajevp/changelog-updater/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/nikolajevp/changelog-updater/compare/v0.1.0...v1.0.0
			`);
	});
});
