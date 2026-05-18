# Gilly's Big Backyard Adventure

A React + Vite + Phaser side-scrolling backyard game.

## Local Development

```bash
yarn install
yarn dev
```

## Build

```bash
yarn build
```

The app uses `base: './'` in `vite.config.js`, so built assets work correctly on GitHub Pages under a repository subpath.

## GitHub Pages Deployment

This project includes `.github/workflows/deploy.yml`. Push to `main`, then in GitHub repository settings enable Pages with **GitHub Actions** as the source.
