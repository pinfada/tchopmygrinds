# Security Policy

## Supported versions
Only the `master` branch receives security updates.

## Reporting a vulnerability
Please report suspected vulnerabilities **privately** rather than opening a public issue:

- Open a [GitHub security advisory](https://github.com/pinfada/tchopmygrinds/security/advisories/new) (preferred), or
- Email the maintainer listed on the repository.

Please include:
- A clear description of the issue and its impact
- Reproduction steps or a proof-of-concept
- The commit / version affected
- Any suggested remediation if you have one

We aim to acknowledge reports within 7 days and to ship a fix or mitigation for confirmed issues as quickly as the severity warrants.

## Scope
In scope:
- The Rails API under `app/`
- The React frontend under `frontend/`
- Build, deployment, and CI configuration in this repository

Out of scope:
- Third-party services we integrate with (Render.com, SendGrid, etc.) — report directly to the vendor
- Social-engineering or physical-access attacks

## Disclosure
Once a fix is available, we will coordinate a disclosure timeline with the reporter and credit them in the release notes unless they prefer to remain anonymous.
