import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Wait a tick for the target page's content to mount before scrolling.
      const id = hash.replace("#", "")
      const scrollToHash = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }
      const timeout = setTimeout(scrollToHash, 0)
      return () => clearTimeout(timeout)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}