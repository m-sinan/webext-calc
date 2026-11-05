import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { AppRoutes } from "./App.jsx"

// Used only at build time by scripts/prerender.mjs.
export function render(url) {
  const helmetContext = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </HelmetProvider>
  )
  return { html, helmet: helmetContext.helmet }
}
