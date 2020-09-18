'use strict';

const fs = require('fs');
const { getOptions } = require('./options');

const version = process.env.npm_package_version;
const date = new Date().toISOString().slice(0, 10);
const changelogFilename = 'CHANGELOG.md';

module.exports = { main };

function main(args) {
	const options = getOptions(args);

	updateChangelog(options);
}

function updateChangelog(options) {
	let changelog = fs.readFileSync(changelogFilename, { encoding: 'utf8' });

	if (options.check) {
		if (isChanged(changelog)) {
			process.exit(0);
		} else {
			throw new Error(`No changes under [Unreleased] in ${changelogFilename}`);
		}
	}
	
	changelog = updateUpperSection(changelog);
	changelog = updateBottomSectionGithub(changelog);
	changelog = updateBottomSectionBitbucket(changelog);

	fs.writeFileSync(changelogFilename, changelog, { encoding: 'utf8' });
}

function isChanged(changelog) {
	/**
	 * matches[1] = first `###` after `## [Unreleased]`
	 */
	const regex = /## \[Unreleased\]\s*(###)/;
	const matches = changelog.match(regex);
	
	return matches ? matches[1] === '###' : false;
}

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
