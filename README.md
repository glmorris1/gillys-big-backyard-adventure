# Gilly's Big Backyard Adventure

A React + Vite + Phaser playable prototype for a fast, funny, rhythm-style auto-scrolling platform game starring Gilly, a cartoon Border Collie puppy.

## Features

- Phaser gameplay rendered inside a React component
- Auto-running platform gameplay with jump and double jump timing
- Keyboard, mouse, and touch input
- Optional jump button mode
- Bounce pads, moving platforms, rotating obstacles, falling hazards, gravity switches, speed boosts, and rhythm gates
- Parallax backgrounds, particles, screen shake, animated transitions, and procedural sound/music
- Sequential level unlocks, best completion percentage, and death counters saved in `localStorage`
- One complete Backyard level plus playable prototype versions of the remaining family-themed levels
- GitHub Pages deployment script

## Install

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Open the local Vite URL shown in your terminal.

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

Update the `homepage` and `base` path if your repository name differs, then run:

```bash
npm run deploy
```

## Controls

- Spacebar or Up Arrow: jump
- Mouse click: jump
- Tap anywhere: jump
- Settings: toggle dedicated jump button mode
