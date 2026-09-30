# Changelog

All notable changes to BackSpec are documented here. The project follows Semantic Versioning and Keep a Changelog.

## [Unreleased]

### Added

- Evidence-based project layout, health, validation, dashboard, and five-engine fresh-install contracts.
- Safe generated-artifact writes with conflict detection, dry-run, force, and backup behavior.
- Offline Agent Code Quality Gate with severity policy, secret redaction, JSON/SARIF reports, and CI integration.
- Windows/Linux CI matrix, package allowlist, security policy, and contribution guide.

### Changed

- `sync --check` now detects drift without mutating the project.
- Health checks now distinguish toolkit templates from unresolved placeholders in managed projects.
