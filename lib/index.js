'use strict';

const fs = require('fs');
const { getOptions } = require('./options');

const version = process.env.npm_package_version;
const date = new Date().toISOString().slice(0, 10);
const changelogFilename = 'CHANGELOG.md';

module.exports = { main };

function main(args) {
	const options = getOptions(args);

	if (options.init) {
		newChangelog();
	} else {
		updateChangelog(options);
	}
}

function newChangelog() {
	let changelog = fs.readFileSync(`${__dirname}/init.md`, {
		encoding: 'utf8',
	});

	const { version, repository } = JSON.parse(
		fs.readFileSync('./package.json', { encoding: 'utf8' })
	);

	if (!repository) {
		throw new Error('`repository` is not set in `package.json`');
	}

	changelog = changelog.replace(
		'[Unreleased]:',
		`[Unreleased]: ${getRepositoryUrl(repository, version)}`
	);

	fs.writeFileSync(changelogFilename, changelog, {
		encoding: 'utf8',
		flag: 'wx',
	});
}

function getRepositoryUrl(repository, version) {
	const getGithubUrl = (name) =>
		`https://github.com/${name}/compare/v${version}...HEAD`;
	const getBitbucketUrl = (name) =>
		`https://bitbucket.org/${name}/branches/compare/HEAD..v${version}`;

	let type;
	let name;

	if (typeof repository === 'string') {
		// "github:user/repo"
		[type, name] = repository.split(':');
	}

	if (typeof repository === 'object' && repository.url) {
		// "https://github.com/user/repo.git"
		[, type, name] = repository.url.match(
			/**
			 * Group 1: (?:[\w+]+?:\/\/)? - scheme, e.g. `git+https://`, optional, non-matching
			 * Group 2: (.+) - domain, e.g. `www.github.com`, required, matching
			 * Group 3: ([\w-]+\/[\w-]+) - username/repository, e.g. `nikolajevp/changelog-updater`, required, matching
			 * Group 4: (?:\.git)? - suffix `.git`, optional, non-matching
			 */
			/^(?:[\w+]+?:\/\/)?(.+)\/([\w-]+\/[\w-]+)(?:\.git)?$/
		);
	}

	switch (true) {
		case type.includes('github'):
			return getGithubUrl(name);
		case type.includes('bitbucket'):
			return getBitbucketUrl(name);
		default:
			throw new Error('Could not find repository URL');
	}
}

function updateChangelog(options) {
	let changelog = fs.readFileSync(changelogFilename, { encoding: 'utf8' });

	if (options.check) {
		if (isChanged(changelog)) {
			process.exit(0);
		} else {
			throw new Error(
				`No changes under [Unreleased] in ${changelogFilename}`
			);
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
