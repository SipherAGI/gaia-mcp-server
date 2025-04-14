# Release Process

This document describes the release process for the Gaia MCP Server project.

## Overview

Gaia MCP Server uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated version management and package publishing. The release process is triggered automatically when commits are pushed to specific branches.

## Branch Strategy

The following branches are configured for releases:

- `main`: Stable releases
- `+([0-9])?(.{+([0-9]),x}).x`: Maintenance releases
- `release/rc`: Release candidates (with `rc` prerelease tag)
- `release/dev`: Development releases (with `dev` prerelease tag)

## Commit Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for structured commit messages. This format is used to automatically determine version bumps and generate the CHANGELOG.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: A new feature (triggers a minor version bump)
- `fix`: A bug fix (triggers a patch version bump)
- `docs`: Documentation changes
- `style`: Changes that don't affect code functionality (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Changes to the build process or auxiliary tools

#### Breaking Changes

Including `BREAKING CHANGE:` in the commit footer or appending `!` to the type/scope will trigger a major version bump.

Example:

```
feat(api)!: rename endpoints for better clarity

BREAKING CHANGE: API endpoints have been renamed to follow new naming convention
```

## Release Process

### Automated Releases

When commits are pushed to configured branches, the following process happens automatically:

1. Commit analysis determines the next version number
2. Release notes are generated from commit messages
3. CHANGELOG.md is updated
4. package.json version is updated
5. Changes are committed to Git
6. A Git tag is created
7. The package is published to npm

### Manual Releases

For manual releases, use the following npm scripts:

```bash
# Standard version bump (determined by commits)
npm run release

# Specific version bumps
npm run release:patch
npm run release:minor
npm run release:major
```

## Plugins Used

The release process uses the following semantic-release plugins:

- `@semantic-release/commit-analyzer`: Analyzes commits to determine version bump
- `@semantic-release/release-notes-generator`: Generates release notes from commits
- `@semantic-release/changelog`: Updates CHANGELOG.md
- `@semantic-release/npm`: Updates package.json and publishes to npm
- `@semantic-release/git`: Commits changes to Git and creates tags

## Assets Updated During Release

- `package.json`: Version number is updated
- `CHANGELOG.md`: Release notes are added

## For Maintainers

1. Ensure all commits follow the Conventional Commits format
2. Use appropriate commit types to trigger correct version bumps
3. For breaking changes, use the `!` syntax or include `BREAKING CHANGE:` in commit message
4. Push to the appropriate branch based on the release type
