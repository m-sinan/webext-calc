import { useState } from "react"
import { Link } from "react-router-dom"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">₹</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">
            WebExt<span className="text-blue-600">.in</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#tools" className="hover:text-blue-600 transition-colors">Tools</a>
          <a href="#how" className="hover:text-blue-600 transition-colors">How it works</a>
          <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <a href="#tools" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Try Free
          </a>
        </div>
        <button className="md:hidden text-gray-600 text-xl" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm text-gray-600">
          <a href="#tools" onClick={() => setMenuOpen(false)}>Tools</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
          <Link to="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
        </div>
      )}
    </nav>
  )
}