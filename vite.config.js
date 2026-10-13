import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Shot Arc (src/shot-arc) is a classic, non-module multi-file JS app: its scripts
// share one global scope and must stay separate, unhashed files loaded in a fixed
// order (see src/shot-arc/index.html). That's incompatible with Rollup's normal
// module bundling, so instead of treating it as a build input, this plugin serves
// it byte-for-byte in dev and copies it byte-for-byte into dist/shot-arc at build
// time — the same way files in public/ are handled, just sourced from src/ so the
// project stays alongside the site's other project folders. Only the (large,
// binary) demo clips live in public/shot-arc/clips, since those need no such
// handling.
function shotArcStatic() {
  const srcDir = path.resolve(__dirname, 'src/shot-arc')
  const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }

  function copyDir(from, to) {
    fs.mkdirSync(to, { recursive: true })
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const fromPath = path.join(from, entry.name)
      const toPath = path.join(to, entry.name)
      if (entry.isDirectory()) copyDir(fromPath, toPath)
      else fs.copyFileSync(fromPath, toPath)
    }
  }

  return {
    name: 'shot-arc-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        const base = server.config.base.endsWith('/') ? server.config.base : server.config.base + '/'
        const prefix = `${base}shot-arc/`
        const url = req.url.split('?')[0]
        if (!url.startsWith(prefix)) return next()

        const rel = url.slice(prefix.length) || 'index.html'
        // Only the plain-script app's own files — not the sibling ShotArc.jsx/css React wrapper.
        if (!(rel === 'index.html' || rel === 'styles.css' || rel.startsWith('js/'))) return next()
        const filePath = path.join(srcDir, rel)
        if (!filePath.startsWith(srcDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return next()

        res.setHeader('Content-Type', mimeTypes[path.extname(filePath)] || 'application/octet-stream')
        fs.createReadStream(filePath).pipe(res)
      })
    },
    closeBundle() {
      // Only the plain-script app, not the sibling ShotArc.jsx/css React wrapper.
      const outDir = path.resolve(__dirname, 'dist/shot-arc')
      fs.mkdirSync(outDir, { recursive: true })
      fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(outDir, 'index.html'))
      fs.copyFileSync(path.join(srcDir, 'styles.css'), path.join(outDir, 'styles.css'))
      copyDir(path.join(srcDir, 'js'), path.join(outDir, 'js'))
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/personal_website/',
  plugins: [react(), shotArcStatic()],

})
