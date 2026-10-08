# Git Remote & Branch Workflow

## 1. Upstream / Primary Repository
- **Main Repository:** `https://github.com/Varunpatel586/Ai-casino.git`
- **Remote Name:** `origin`
- **Personal Fork Remote:** `pranav-fork` (`https://github.com/pranavadva/ai-casino.git`)

## 2. Active Working Branch
- **Active Branch:** `pranav`
- All ongoing development, bug fixes, and feature additions MUST be committed to the `pranav` branch.
- All pushes MUST target `origin pranav` (`git push origin pranav`).

## 3. GitHub Permissions
- Note: Pushing directly to `Varunpatel586/Ai-casino` requires collaborator / write access on GitHub.
- If a push returns `HTTP 403: Permission denied to pranavadva`, ensure the user has accepted the repository invitation at `https://github.com/Varunpatel586/Ai-casino/invitations` or has been granted write access by Varun.
