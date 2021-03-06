# changelog-updater
[![npm package](https://img.shields.io/npm/v/changelog-updater.svg?style=flat-square)](https://www.npmjs.org/package/changelog-updater)
[![GitHub license](https://img.shields.io/github/license/nikolajevp/changelog-updater.svg)](https://github.com/nikolajevp/changelog-updater/blob/master/LICENSE)
[![Dependencies](https://img.shields.io/david/nikolajevp/changelog-updater.svg?style=flat-square)](https://david-dm.org/nikolajevp/changelog-updater)
[![Build Status](https://travis-ci.org/nikolajevp/changelog-updater.svg?branch=master)](https://travis-ci.org/nikolajevp/changelog-updater)
[![Coverage Status](https://coveralls.io/repos/github/nikolajevp/changelog-updater/badge.svg?branch=master)](https://coveralls.io/github/nikolajevp/changelog-updater?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Update [Unreleased] in CHANGELOG.md to current package version.

Expects the changelog to follow [keepachangelog.com v1.0.0](http://keepachangelog.com/en/1.0.0/) guidelines.

## Usage
1. Install with npm:
   
```bash
$ npm i -D changelog-updater
```

2. Add script `version` to `package.json`:
   
```json
{
  "scripts": {
    "version": "changelog-updater && git add CHANGELOG.md"
  }
}
```

## Options

### `--init`

Creates a new changelog if it does not exist.

Set `repository` in `package.json`:

```json
{
  "repository": {
    "url": "https://github.com/username/repository.git"
  }
}
```

Use in the root of your new project:

```bash
$ npx changelog-updater --init
```

### `--check`

Fails if the changelog does not have any changes under [Unreleased], otherwise exits normally without updating the changelog.

Use as a pre-commit hook or in testing pipelines:

```bash
$ npx changelog-updater --check
```

Or, use as a `preversion` script:

```json
{
  "scripts": {
    "preversion": "changelog-updater --check",
    "version": "changelog-updater && git add CHANGELOG.md"
  }
}
```
