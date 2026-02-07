# Pull Request Preview Deployment - Implementation Plan

## Current State Analysis
- The project is a SvelteKit application using Bun as package manager
- Current deployment: `deploy.yml` workflow runs on push to `master` branch
- Build command: `bun run build` (outputs to `build/` directory)
- Base path configuration: Uses `BASE_PATH` environment variable (set to `/${{ github.event.repository.name }}`)
- Adapter: `@sveltejs/adapter-static` for static site generation
- Deployment target: GitHub Pages via `actions/deploy-pages@v4`

## Requirements
1. Create new workflow that runs on pull_request events
2. Build the site using Bun and existing build step
3. Deploy to separate Pages environment for previews
4. Don't affect production `github-pages` environment
5. Don't affect existing `deploy.yml` workflow
6. Update configuration for base paths for preview URLs
7. Provide clear documentation about preview URLs

## Implementation Approach (Option A - Separate Preview Environment)

### Key Components:
1. **New Workflow File**: `.github/workflows/preview-deploy.yml`
   - Trigger: `pull_request` events (opened, synchronize, reopened)
   - Build step: Same as production (uses Bun)
   - Deploy to a separate environment: `preview-pr-{PR_NUMBER}`
   - Set `BASE_PATH` to `/knots/pr-{PR_NUMBER}` for preview URLs

2. **Base Path Configuration**:
   - Preview builds will use dynamic base path: `/knots/pr-{PR_NUMBER}`
   - Production builds keep existing path: `/knots`
   - SvelteKit config already supports `BASE_PATH` env variable

3. **Preview Environment Setup**:
   - Each PR gets its own environment: `preview-pr-{PR_NUMBER}`
   - GitHub Actions will create these environments automatically
   - Preview URLs will be: `https://{owner}.github.io/knots/pr-{PR_NUMBER}/`

4. **Documentation**:
   - Add README section about preview deployments
   - Add comments in the workflow file
   - Preview URL is posted automatically via deployment environment

## Minimal Changes Required:
1. Create `.github/workflows/preview-deploy.yml` (new file)
2. Update README.md with preview deployment information (optional but recommended)

## Benefits:
- ✅ Zero impact on production deployment
- ✅ Each PR gets isolated preview environment
- ✅ Preview URLs automatically visible in PR's "Deployments" section
- ✅ Simple and maintainable approach
- ✅ Uses existing build configuration
- ✅ No changes to production workflow needed

## Technical Notes:
- GitHub Pages supports multiple deployment environments
- The `actions/deploy-pages@v4` action automatically handles environment separation
- Preview deployments will be accessible via: `{base_url}/pr-{number}/`
- No cleanup workflow needed initially (can be added later if disk space becomes an issue)
