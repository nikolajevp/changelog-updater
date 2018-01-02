'use strict';

const fs = require('fs');
const version = process.env.npm_package_version;
const date = new Date().toISOString().slice(0, 10);
const changelogFileName = 'CHANGELOG.md';

function updateUpperSection(changelog) {
	return changelog.replace(
		/## \[Unreleased\]/,
		`## [Unreleased]\n\n## [${version}] - ${date}`
	);
}

function updateBottomSectionGithub(changelog) {
	/**
	 * matches[0] = `[Unreleased]: https://github.com/nikolajevp/changelog-updater/compare/v1.0.0...HEAD`
	 * matches[1] = ` https://github.com/nikolajevp/changelog-updater/compare/`
	 * matches[2] = `1.0.0`
	 */
	const regex = /\[Unreleased\]:(.+\/)v(.+)\.\.\.HEAD/i;
	const matches = changelog.match(regex);

	if (matches) {
		const url = matches[1];
		const previousVersion = matches[2];
		const compareToUnreleased = `[Unreleased]:${url}v${version}...HEAD`;
		const compareToLatestVersion = `[${version}]:${url}v${previousVersion}...v${version}`;

		changelog = changelog.replace(
			regex,
			`${compareToUnreleased}\n${compareToLatestVersion}`
		);
	}

	return changelog;
}

function updateBottomSectionBitbucket(changelog) {
	/**
	 * matches[0] = `[Unreleased]: https://bitbucket.org/nikolajevp/changelog-updater/branches/compare/HEAD..v1.0.0`
	 * matches[1] = ` https://bitbucket.org/nikolajevp/changelog-updater/branches/compare/`
	 * matches[2] = `1.0.0`
	 */
	const regex = /\[Unreleased\]:(.+)HEAD\.\.v(.+)/i;
	const matches = changelog.match(regex);

	if (matches) {
		const url = matches[1];
		const previousVersion = matches[2];
		const compareToUnreleased = `[Unreleased]:${url}HEAD..v${version}`;
		const compareToLatestVersion = `[${version}]:${url}v${version}..v${previousVersion}`;

		changelog = changelog.replace(
			regex,
			`${compareToUnreleased}\n${compareToLatestVersion}`
		);
	}

	return changelog;
}

function updateChangelog() {
	fs.readFile(changelogFileName, 'utf8', (err, changelog) => {
		if (err) {
			throw err;
		}

		changelog = updateUpperSection(changelog);
		changelog = updateBottomSectionGithub(changelog);
		changelog = updateBottomSectionBitbucket(changelog);

		fs.writeFile(changelogFileName, changelog, 'utf8', (err) => {
			if (err) {
				throw err;
			}
		});
	});
}

module.exports = updateChangelog;
