[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![AI agent ready](https://img.shields.io/badge/AI_agent-ready-2ea44f?style=flat-square)](https://github.com/Interested-Deving-1896/fork-sync-all/blob/main/DOCS/ai-agent-badges.md)
[![Open in Codex](https://img.shields.io/badge/Open_in-Codex-000000?style=flat-square&logo=openai&logoColor=white)](https://openai.com/codex/)
[![Open in Claude Code](https://img.shields.io/badge/Open_in-Claude_Code-d97757?style=flat-square&logo=anthropic&logoColor=white)](https://claude.ai/code)
[![Open in GitHub Copilot](https://img.shields.io/badge/Open_in-GitHub_Copilot-181717?style=flat-square&logo=githubcopilot&logoColor=white)](https://github.com/copilot)
[![Open in Cursor](https://img.shields.io/badge/Open_in-Cursor-111111?style=flat-square)](https://cursor.com/)
[![Use with Gemini CLI](https://img.shields.io/badge/Use_with-Gemini_CLI-4285f4?style=flat-square&logo=googlegemini&logoColor=white)](https://github.com/google-gemini/gemini-cli)
[![KDE Eco](https://img.shields.io/badge/KDE%20Eco-certified-brightgreen?logo=kde&logoColor=white&style=flat-square)](https://eco.kde.org/) [![Blue Angel](https://img.shields.io/badge/Blue%20Angel-DE--UZ%20215-0055a4?style=flat-square)](https://www.blauer-engel.de/en/certification/criteria)




<!-- AI:start:what-it-does -->
Penguins-Eggs is a remastering tool that allows users to create custom Linux distributions or live systems based on various Linux distributions, including Debian, Ubuntu, Arch, Fedora, and others. It is designed for system administrators, developers, and enthusiasts who need to replicate, customize, or distribute operating system environments efficiently.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The architecture of `penguins-eggs` is modular, leveraging TypeScript and the oclif framework for CLI development. The project is designed to facilitate system remastering across multiple Linux distributions. Key components include:

1. **CLI Interface**: Built using `@oclif/core`, it provides commands for creating and managing system remasters.
2. **Integrations**: Located in the `integrations` directory, this module handles distribution-specific logic and external tool integrations.
3. **Core Utilities**: Dependencies like `axios`, `js-yaml`, and `systeminformation` are used for system data retrieval, configuration parsing, and API interactions.
4. **UI Components**: Built with `ink` and related libraries for interactive terminal-based user interfaces.
5. **Workflows**: GitHub Actions workflows automate CI/CD, documentation generation, repository synchronization, and artifact mirroring.

The directory structure is as follows:

```plaintext
penguins-eggs/
├── bin/                 # Entry point for the CLI
├── integrations/        # Distribution-specific integrations
├── src/                 # Core application logic
├── workflows/           # GitHub Actions workflows
├── package.json         # Project metadata and dependencies
├── README.md            # Documentation
└── tests/               # Unit and integration tests
```
<!-- AI:end:architecture -->

## Install

<!-- Add installation instructions here. This section is yours — the AI will not modify it. -->

```bash
git clone https://github.com/Interested-Deving-1896/penguins-eggs.git
cd penguins-eggs
```

## Usage


### Create a clean ISO

Produces a distributable live ISO without user data:

```bash
sudo eggs produce
```

### Clone your system

| Goal | Command | Notes |
|---|---|---|
| Standard clone | `eggs produce --clone` | User data copied unencrypted — do not share publicly |
| Home encryption | `eggs produce --homecrypt` | `/home` encrypted with LUKS inside the ISO |
| Full encryption | `eggs produce --fullcrypt` | Entire system encrypted (Debian/Devuan only) |

### Compression options

| Flag | Compressor | Use case |
|---|---|---|
| _(default)_ | zstd fast | General use |
| `--pendrive` | zstd level 15 | Optimised for USB drives |
| `--standard` | xz | Smaller size, slower |
| `--max` | xz -Xbcj | Maximum compression |

---

## Configuration

<!-- Document configuration options here. This section is yours — the AI will not modify it. -->

## CI

<!-- AI:start:ci -->
- **ci.yml**: Runs linting, unit tests, and build checks for the project. No secrets required.
- **codeql.yml**: Performs static code analysis using GitHub CodeQL to detect vulnerabilities. No secrets required.
- **release.yml**: Automates the release process, including version tagging and publishing. Requires `GH_TOKEN` for repository access.
- **iso-test.yml**: Tests ISO builds for compatibility and functionality. Requires `ISO_TEST_KEY` for authentication.
- **mirror.yaml**: Mirrors the repository to external platforms. Requires `MIRROR_TOKEN` for access.
- **sync-eggs-docs-to-book.yml**: Syncs documentation to the project book repository. Requires `DOCS_SYNC_TOKEN`.
- **mirror-releases.yml**: Mirrors release artifacts to external storage. Requires `RELEASE_MIRROR_KEY`.
- **rate-limit-status.yml**: Monitors API rate limits and logs status. No secrets required.
- **rotate-token.yml**: Rotates API tokens for security. Requires `ADMIN_TOKEN`.
- **frogbot-scan.yml**: Scans dependencies for vulnerabilities using Frogbot. Requires `JFROG_API_KEY`.
- **trigger-book-sync.yml**: Triggers synchronization of the project book. Requires `BOOK_SYNC_TRIGGER_KEY`.
<!-- AI:end:ci -->

## Mirror chain

<!-- AI:start:mirror-chain -->
This repo is maintained in [`Interested-Deving-1896/penguins-eggs`](https://github.com/Interested-Deving-1896/penguins-eggs) and mirrored through:

```
Interested-Deving-1896/penguins-eggs  ──►  OpenOS-Project-OSP/penguins-eggs  ──►  OpenOS-Project-Ecosystem-OOC/penguins-eggs
```

Changes flow downstream automatically via the hourly mirror chain in
[`fork-sync-all`](https://github.com/Interested-Deving-1896/fork-sync-all).
Direct commits to OSP or OOC are detected and opened as PRs back to `Interested-Deving-1896`.
<!-- AI:end:mirror-chain -->

## Contributors

<!-- AI:start:contributors -->
| Contributor | Commits |
|---|---|
| [@monstermunchkin](https://github.com/monstermunchkin) | 818 |
| [@stgraber](https://github.com/stgraber) | 785 |
| [@Interested-Deving-1896](https://github.com/Interested-Deving-1896) | 485 |
| [@itoffshore](https://github.com/itoffshore) | 155 |
| [@pieroproietti](https://github.com/pieroproietti) | 56 |
| [@ona-agent](https://github.com/ona-agent) | 50 |
| [@simondeziel](https://github.com/simondeziel) | 32 |
| [@nanjj](https://github.com/nanjj) | 23 |
| [@masnax](https://github.com/masnax) | 16 |
| [@brauner](https://github.com/brauner) | 13 |
| [@mjrider](https://github.com/mjrider) | 11 |
| [@tew42](https://github.com/tew42) | 10 |
| [@chaosoffire](https://github.com/chaosoffire) | 9 |
| [@ona-bot](https://github.com/ona-bot) | 9 |
| [@stefanor](https://github.com/stefanor) | 6 |
| [@Obirvalger](https://github.com/Obirvalger) | 5 |
| [@nbuwe](https://github.com/nbuwe) | 5 |
| [@adamcstephens](https://github.com/adamcstephens) | 5 |
| [@gibmat](https://github.com/gibmat) | 5 |
| [@hallyn](https://github.com/hallyn) | 5 |
| [@dependabot[bot]](https://github.com/apps/dependabot) | 4 |
| [@web-flow](https://github.com/web-flow) | 4 |
| [@geaaru](https://github.com/geaaru) | 4 |
| [@eddyg](https://github.com/eddyg) | 3 |
| [@tenforward](https://github.com/tenforward) | 3 |
| [@marcosps](https://github.com/marcosps) | 3 |
| [@stiltr](https://github.com/stiltr) | 3 |
| [@timbretimber](https://github.com/timbretimber) | 3 |
| [@foxtrotcz](https://github.com/foxtrotcz) | 3 |
| [@gnustomp](https://github.com/gnustomp) | 2 |
<!-- AI:end:contributors -->

## Origins

<!-- AI:start:origins -->
_Original project — no upstream influences recorded._
<!-- AI:end:origins -->

## Resources

<!-- AI:start:resources -->
_No additional resource files found._
<!-- AI:end:resources -->

## Accessibility

<!-- AI:start:accessibility -->
This repo uses automated accessibility auditing via `check-accessibility.yml`.

Checks include: CODEOWNERS ownership coverage, README screen-reader compatibility,
WCAG 2.1 AA HTML compliance, audio overview (espeak-ng), and Braille output (liblouis).




Run the [Check Accessibility](https://github.com/Interested-Deving-1896/penguins-eggs/actions/workflows/check-accessibility.yml)
workflow to generate the first report and accessibility artifacts.
See the [W3C Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
for the underlying accessibility reference.
<!-- AI:end:accessibility -->

## License

<!-- AI:start:license -->
<!-- License not detected — add a LICENSE file to this repo. -->
<!-- AI:end:license -->
