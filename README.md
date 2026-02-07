# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv create --template minimal --types ts --add prettier tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:static" --install bun svelte_knots
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Deployment

### Production Deployment

The project is automatically deployed to GitHub Pages when changes are pushed to the `master` branch. The production site is available at: https://AQSAMA.github.io/knots/

### Pull Request Previews

Every pull request automatically gets its own preview deployment! When you open a PR:

1. The preview workflow automatically builds your changes
2. A preview environment is created at: `https://AQSAMA.github.io/knots/pr-{PR_NUMBER}/`
3. The preview URL is posted in the PR under the **"Environments"** section
4. The preview updates automatically with each new commit to the PR

**To find your preview URL:**
- Look for the "View deployment" button in your PR's **Environments** section
- Or check the workflow run details in the **Actions** tab

Preview deployments are isolated from production and from each other, so you can safely test changes without affecting the live site.
