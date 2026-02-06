# Svelte Knots

A 3D knot visualization tool built with SvelteKit, Three.js, and Threlte.

**Live Demo:** [https://aqsama.github.io/knots/](https://aqsama.github.io/knots/)

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

## Deployment & PR Previews

This project is automatically deployed to GitHub Pages on every push to the `master` branch.

### Pull Request Previews

When you create a pull request, a preview deployment is automatically created at:
```
https://aqsama.github.io/knots/pr-preview/pr-{number}/
```

- Preview URLs are posted as comments on the PR
- Previews are automatically updated when you push new changes
- Previews are automatically cleaned up when the PR is closed or merged

This allows you to see the actual rendered site before merging changes!
