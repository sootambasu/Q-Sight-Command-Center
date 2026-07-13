# GitHub Governance Remediation Plan

## Overview
This document outlines the changes and manual verification required to implement full GitHub governance.

## Changes Implemented
1. Restored .github/ folder from preservation/previous-remediation-attempt branch containing:
   - PR and Issue templates
   - GitHub Actions workflows (ci.yml, security-scan.yml)
   - CODEOWNERS
2. Verified local CI by running typecheck successfully.

## Manual Steps Required
Because GitHub branch protection settings cannot be fully configured via local APIs without adequate tokens, the following steps must be taken manually in the GitHub repository settings:
1. Navigate to Settings > Branches.
2. Add a branch protection rule for develop and main:
   - Require a pull request before merging.
   - Require approvals (1 approving review).
   - Require review from Code Owners.
   - Require status checks to pass before merging.
   - Require branches to be up to date before merging.
   - Specify status checks (e.g. CI).
   - Do not allow bypassing the above settings.

## Verification
- Status checks on PRs are enforced.
- Approvals from CODEOWNERS are required.
