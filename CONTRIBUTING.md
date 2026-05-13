# Contributing to Jenny

Thanks for contributing to Jenny.

## Workflow
- Create a short-lived branch for each change.
- Keep pull requests focused on one issue or one small slice of work.
- Link the related issue in the pull request description.

## Local setup
1. Install dependencies:
   - `npm run install-all`
2. Create the required backend environment file.
3. Start the local app:
   - `npm run dev`

## Validation
Run the smallest relevant check before opening a pull request.
- Docs or workflow-only changes: review rendered Markdown or template output.
- App changes: `npm run build`
- Local integration check when needed: `npm run dev`

## Pull request expectations
- Describe what changed and why.
- Note any environment or API assumptions.
- Include screenshots when the frontend behavior changes.
- Keep follow-up work in separate issues instead of expanding the PR.
