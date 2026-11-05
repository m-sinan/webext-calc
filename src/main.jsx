import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import { Analytics } from '@vercel/analytics/react';
import "./index.css"
import App from "./App.jsx"

const container = document.getElementById("root")

const app = (
  <StrictMode>
    <HelmetProvider>
      <App />
      <Analytics />
    </HelmetProvider>
  </StrictMode>
)

// Production pages are prerendered at build time, so the container already
// holds the page's HTML and React attaches to it. In `npm run dev` the
// container is empty, so render from scratch.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
