# Contributing

1. Create or update the feature bundle in `.sdd/specs/`.
2. Keep generated artifacts backward compatible unless the spec approves a breaking change.
3. Run `npm test`, `node bin/backspec.js validate`, `node bin/backspec.js sync --check`, and `node bin/backspec.js quality . --strict`.
4. Use Conventional Commits and include verification evidence in the pull request.

Never commit credentials, modify an existing database migration, or bypass a failing quality gate.
