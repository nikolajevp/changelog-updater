'use strict';

const fs = require('fs');
const version = process.env.npm_package_version;
const date = new Date().toISOString().slice(0, 10);
const changelogFileName = 'CHANGELOG.md';

function updateChangelog() {
	fs.readFile(changelogFileName, 'utf8', (err, changelog) => {
		if (err) {
			throw err;
		}

		changelog = changelog.replace(
			/## \[Unreleased\]/,
			`## [Unreleased]\n\n## [${version}] - ${date}`
		);

		/**
		 * unreleasedLink[0] = `[Unreleased]: https://github.com/nikolajevp/changelog-updater/compare/v1.0.0...HEAD`
		 * unreleasedLink[1] = ` https://github.com/nikolajevp/changelog-updater/compare/v1.0.0`
		 * unreleasedLink[2] = ` https://github.com/nikolajevp/changelog-updater/compare/`
		 */
		const unreleasedLink = changelog.match(
			/\[Unreleased\]:((.+\/).+)\.\.\.HEAD/i
		);

		if (unreleasedLink) {
			const dynamicResult = `[Unreleased]:${
				unreleasedLink[2]
			}v${version}...HEAD\n[${version}]:${
				unreleasedLink[1]
			}...v${version}`;

			changelog = changelog.replace(
				/\[Unreleased\]:((.+\/).+)\.\.\.HEAD/i,
				dynamicResult
			);
		}

		fs.writeFile(changelogFileName, changelog, 'utf8', (err) => {
			if (err) {
				throw err;
			}
		});
	});
}

module.exports = updateChangelog;
