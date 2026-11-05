// Build-time prerender. Runs after `vite build` (client) and
// `vite build --ssr` (server entry). For every URL in the sitemap it renders
// the React app to HTML and writes dist/<route>/index.html, so Google gets a
// finished page (title, description, canonical, content) on the first request.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const distDir = path.join(root, "dist")
const serverEntry = path.join(root, "dist-server", "entry-server.js")

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8")
const { render } = await import(pathToFileURL(serverEntry).href)

// Routes come from the sitemap, so every page listed there gets prerendered.
const sitemap = fs.readFileSync(path.join(root, "public", "sitemap.xml"), "utf-8")
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname.replace(/\/$/, "") || "/")

// React 19 puts <title>, <meta> and <link> into the render output. Pull
// them out so they can be placed in <head> instead of the body.
// JSON-LD <script> tags are deliberately NOT moved: pages render them in the
// body (e.g. FaqSchema), and moving them would break hydration.
const HEAD_TAG = /<title>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*rel="canonical"[^>]*>/g

// Neutral, un-prerendered shell. vercel.json rewrites unknown URLs to this
// file, so a URL that has no prerendered page never receives another
// page's HTML (dist/index.html is the prerendered homepage).
fs.writeFileSync(path.join(distDir, "app-shell.html"), template)

let failed = 0
for (const route of routes) {
  const { html } = render(route)
  const headTags = html.match(HEAD_TAG) || []
  const body = html.replace(HEAD_TAG, "")

  let page = template.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  if (!page.includes(body.slice(0, 40))) {
    console.error(`FAILED to inject body for ${route}`)
    failed++
    continue
  }
  page = page.replace("</head>", `${headTags.join("\n")}\n</head>`)

  const outDir = route === "/" ? distDir : path.join(distDir, route)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, "index.html"), page)
  console.log(`prerendered ${route} (${headTags.length} head tags, ${Math.round(body.length / 1024)} KB)`)
}

fs.rmSync(path.join(root, "dist-server"), { recursive: true, force: true })
if (failed) process.exit(1)
