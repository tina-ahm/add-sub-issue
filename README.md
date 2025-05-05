# GitHub Action for automatically adding sub-issues to a main issue.

A GitHub Action that automatically adds sub-issues to the given issue.

This action is largely based on GitHub's [typescript-action template](https://github.com/actions/typescript-action).

## Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

1. Install the dependencies

   ```bash
   npm install
   ```

2. Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

## Before committing any changes

```bash
npm run all && npx prettier --write .
```
