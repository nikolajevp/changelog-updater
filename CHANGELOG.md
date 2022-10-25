# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Updated
- upgrade dependencies to reduce security risk

### Changed
- replaced `process.exit(0)` with simple return, otherwise package can't be used as dependency (since it exists the whole process, while control should stay at callee)

## [2.0.2] - 2020-10-05
### Changed
- Changed `--check` error message to describe that headings under \[Unreleased\] should be at level 3 (`###`)

### Fixed
- Allow `--init` to identify SSH links and URLs with scheme containing `+` in `repository.url`

## [2.0.1] - 2020-09-24
### Fixed
- Allow `--init` to identify URL in `repository.url` with any scheme, any domain name (e.g. `www.` or without), and with suffix `.git` or without

## [2.0.0] - 2020-09-23
### Added
- Command-line option `--init` to create a new changelog if it does not exist.
- Command-line option `--check` to check if changelog has any changes under \[Unreleased\].

### Removed
- **[BREAKING CHANGE]** Removed support for Node versions <= 8

## [1.1.0] - 2018-01-02
### Added
- Support for BitBucket

## [1.0.0] - 2017-12-12
### Added
- Unit tests
- Eslint

## 0.1.0 - 2017-12-09
### Added
- Initial commit

[Unreleased]: https://github.com/nikolajevp/changelog-updater/compare/v2.0.2...HEAD
[2.0.2]: https://github.com/nikolajevp/changelog-updater/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/nikolajevp/changelog-updater/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/nikolajevp/changelog-updater/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/nikolajevp/changelog-updater/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/nikolajevp/changelog-updater/compare/v0.1.0...v1.0.0
