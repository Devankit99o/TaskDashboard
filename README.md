# Task Management Dashboard

A React + TypeScript + Vite task management dashboard with:

- Create, edit, and delete tasks
- Status and priority filters
- Search support
- List/card view toggle
- Local persistence via Redux state + storage

## Live URL

`https://task-dashboard-mu-lime.vercel.app/`

## Local Development

Install dependencies:

```bash
npm install
```

If PowerShell blocks `npm` scripts on your machine, use:

```bash
npm.cmd install
```

Run dev server:

```bash
npm run dev
```

Build production files:

```bash
npm run build
```

## Deployment

### Option 1: Vercel (recommended)

```bash
vercel login
npx vercel --prod
```

### Option 2: Netlify

1. Run `npm run build`
2. Go to Netlify dashboard
3. Create a new site from local files and upload the `dist` folder
4. Copy generated URL and update the `Live URL` section

### Option 3: GitHub Pages

1. Push this repository to GitHub (default branch: `main`)
2. Go to repository settings -> Pages
3. Set Source to `GitHub Actions`
4. Push to `main` (or run the `Deploy to GitHub Pages` workflow manually)
5. Copy the published URL and set `Live URL` as:
   `https://<github-username>.github.io/<repository-name>/`

This repo includes `.github/workflows/deploy-gh-pages.yml`, which builds and deploys `dist` automatically.
