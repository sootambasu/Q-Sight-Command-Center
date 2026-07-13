# GitHub Repository and Governance Evidence (Wave 0)

## 1. Remote Branch and Tag Validation

**Repository URL:** `https://github.com/sootambasu/Q-Sight-Command-Center.git`

The following branches and tags have been verified in the remote repository via `git ls-remote`:

- `refs/heads/main` -> `4cf689836d8dde0aa179c9de4e6b8c5159590762`
- `refs/heads/develop` -> `4cf689836d8dde0aa179c9de4e6b8c5159590762`
- `refs/tags/prototype-baseline-2026-07-13` -> `606d92e632fd4d164724777134df3a1b7d89f646` (annotated tag)
- `refs/tags/prototype-baseline-2026-07-13^{}` -> `4cf689836d8dde0aa179c9de4e6b8c5159590762` (commit it points to)

## 2. Baseline Verification

- **Candidate SHA (`4cf6898`)** was thoroughly inspected against the preserved remediation changes.
- **Classification:** `TRUE_BASELINE`.
- **Reasoning:** `git show --name-status` and `git log` revealed that `4cf6898` contains exactly the pre-remediation source code (prototype files, baseline exclusions, and initial documentation), without any of the mock-data fallback modifications, database migration edits, or governance files introduced during the previous incomplete remediation attempt.

## 3. Clean-Clone Verification

A clean clone was successfully executed into an isolated directory (`D:\Q-Sight Command Center Clean Verification`). 

**Checklist:**
- [x] `main` exists remotely.
- [x] `develop` exists remotely.
- [x] `prototype-baseline-2026-07-13` exists remotely.
- [x] `prototype-baseline-2026-07-13` points to SHA `4cf6898`.
- [x] Clean clone succeeds.
- [x] Repository contents are complete (workspaces, `apps`, `packages`, `workers`, `infra`, and all `.env.example` templates present).
- [x] No secrets are present (only `.env.*.example` templates exist, `.gitignore` successfully prevented actual `.env` files from entering the baseline).

## 4. Preservation Audit

The dirty-tree work from the previous attempt was securely preserved in the local branch `preservation/previous-remediation-attempt` (commit `9bfd449`). 
- **Audit Decision**: Reusable assets (like the `CODEOWNERS`, SQL migration templates, and architectural markdown documents) will be carefully evaluated and transplanted during their respective agent implementations. They were not mixed into the baseline.

**Wave 0 is complete. The project is ready for Wave 1 implementation agents.**
