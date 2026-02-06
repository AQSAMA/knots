# Plan: PR Preview Implementation for GitHub Pages

## Problem Understanding
The repository uses GitHub Pages to display a SvelteKit static site. When PRs are created, there's no way to preview the actual rendered site before merging. We need to implement PR preview functionality.

## Current Setup
- SvelteKit static site built with Vite and Bun
- Deployed to GitHub Pages via `.github/workflows/deploy.yml`
- Triggers only on push to `master` branch
- Uses `actions/upload-pages-artifact` and `actions/deploy-pages`

## Solution Approach
Since GitHub Pages doesn't natively support multiple concurrent deployments (one for main + one per PR), we'll use a common approach:

**Selected Solution: Use gh-pages branch with subdirectories**
- Create a `gh-pages` branch structure with PR preview subdirectories
- Deploy main site to root
- Deploy PR previews to `/pr-preview/pr-{number}/`
- Use GitHub Actions to manage the branch
- Comment on PR with preview link

## Implementation Steps

### Phase 1: Create PR Preview Workflow
1. Create a new workflow `.github/workflows/preview-pr.yml` that:
   - Triggers on `pull_request` events (opened, synchronized, reopened)
   - Builds the site with BASE_PATH set to `/knots/pr-preview/pr-{number}`
   - Deploys to `gh-pages` branch under `pr-preview/pr-{number}/`
   - Comments on the PR with the preview URL

### Phase 2: Create PR Cleanup Workflow  
2. Create a workflow to cleanup PR previews when PRs are closed:
   - Triggers on `pull_request` (closed)
   - Removes the corresponding `pr-preview/pr-{number}/` directory
   - Updates the comment or adds a note that preview was removed

### Phase 3: Update Main Deployment (if needed)
3. Ensure main deployment still works correctly with the new setup

### Phase 4: Testing
4. Test the workflow to ensure previews work correctly

## Key Considerations
- Must handle BASE_PATH correctly for subdirectory deployments
- Need appropriate permissions for workflows
- Should avoid conflicts between concurrent PR builds
- Must handle PR preview cleanup to avoid bloating the gh-pages branch
