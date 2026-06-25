# Stats Haven

Stats Haven is a React web app that serves as a beacon for statistics notes, formulas, references, and useful intuitive calculators.  
  
The goal of this project is to create a free, organized, and accessible resource for students learning statistics.  
  
  
## Topics

### Probability

### Statistical Inference

### Regression

### Machine Learning

## License

This project is open source and available under the MIT License.

## Deploying to GitHub Pages

This repository is configured to deploy the built site to GitHub Pages using `gh-pages`.

- Scripts added to `package.json`:
	- `predeploy`: runs `npm run build`
	- `deploy`: runs `gh-pages -d dist`

- Routing: the app now uses `HashRouter` to avoid 404s on GitHub Pages.
- Vite `base` is set to `./` so built assets use relative paths.

To deploy from the `stats-haven` folder:

```bash
npm install
npm run deploy
```

If you prefer `BrowserRouter`, set a `base` matching your repo (in `vite.config.js`) and configure GitHub Pages accordingly, or use a custom domain.