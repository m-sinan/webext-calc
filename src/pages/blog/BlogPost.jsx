import { useParams, Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { posts } from "./posts/index"

const postModules = {
  "emi-for-30-lakh-home-loan": () => import("./posts/emi-for-30-lakh-home-loan"),
  "inhand-salary-6-lpa-bangalore": () => import("./posts/inhand-salary-6-lpa-bangalore"),
  "fd-vs-sip-3-years": () => import("./posts/fd-vs-sip-3-years"),
}

import { useState, useEffect } from "react"

const categoryColors = {
  "Home Loan": "bg-blue-100 text-blue-700",
  "Salary": "bg-green-100 text-green-700",
  "Investment": "bg-amber-100 text-amber-700",
  "Tax": "bg-purple-100 text-purple-700",
}

function renderMarkdown(content) {
  return content
    .trim()
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">{line.replace("## ", "")}</h2>
      if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-bold text-gray-800 mt-6 mb-2">{line.replace("### ", "")}</h3>
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-gray-800 my-2">{line.replace(/\*\*/g, "")}</p>
      if (line.startsWith("- ")) return <li key={i} className="text-gray-600 text-sm ml-4 list-disc my-1">{line.replace("- ", "")}</li>
      if (line.startsWith("|")) return null
      if (line.trim() === "") return <div key={i} className="my-2" />

      // Handle inline links like [text](/url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
      const parts = []
      let last = 0
      let match
      const lineStr = line
      while ((match = linkRegex.exec(lineStr)) !== null) {
        if (match.index > last) parts.push(lineStr.slice(last, match.index))
        parts.push(<Link key={match.index} to={match[2]} className="text-blue-600 hover:underline font-semibold">{match[1]}</Link>)
        last = match.index + match[0].length
      }
      if (last < lineStr.length) parts.push(lineStr.slice(last))

      if (parts.length > 0 && parts.some(p => typeof p !== "string")) {
        return <p key={i} className="text-gray-600 text-sm leading-relaxed my-2">{parts}</p>
      }

      return <p key={i} className="text-gray-600 text-sm leading-relaxed my-2">{line}</p>
    })
}

function renderTable(content) {
  const lines = content.trim().split("\n")
  const tables = []
  let i = 0
  let result = []

  while (i < lines.length) {
    if (lines[i].startsWith("|")) {
      const tableLines = []
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i])
        i++
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split("|").filter(c => c.trim()).map(c => c.trim())
        const rows = tableLines.slice(2).map(row => row.split("|").filter(c => c.trim()).map(c => c.trim()))
        tables.push(
          <div key={i} className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  {headers.map((h, hi) => (
                    <th key={hi} className="text-left px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-gray-600 border border-gray-100">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    } else {
      i++
    }
  }

  return tables
}

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const meta = posts.find(p => p.slug === slug)

  useEffect(() => {
    const loader = postModules[slug]
    if (loader) {
      loader().then(mod => {
        setPost(mod.post)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  if (!post) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-800 mb-2">Post not found</p>
        <Link to="/blog" className="text-blue-600 hover:underline">← Back to blog</Link>
      </div>
    </div>
  )

  const contentLines = post.content.trim().split("\n")
  const tableContent = post.content
  const tables = renderTable(tableContent)
  let tableIndex = 0

  const rendered = contentLines.map((line, i) => {
    if (line.startsWith("|")) {
      if (i === 0 || !contentLines[i-1].startsWith("|")) {
        return tables[tableIndex++] || null
      }
      return null
    }
    return renderMarkdown(line + "\n")[0]
  }).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>{post.title} | WebExt.in</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={`https://webext.in/blog/${post.slug}`} />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <Link to="/blog" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to blog</Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (categoryColors[post.category] || "bg-gray-100 text-gray-600")}>
              {post.category}
            </span>
            <span className="text-xs text-gray-400">{post.readTime}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">
              {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-500 text-sm mb-8 pb-6 border-b border-gray-100">{post.description}</p>

          <div className="prose max-w-none">
            {rendered}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-3">Free Calculators</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "EMI Calculator", href: "/emi-calculator", icon: "🏠" },
              { label: "Salary Calculator", href: "/salary-calculator", icon: "💼" },
              { label: "FD Calculator", href: "/fd-calculator", icon: "💰" },
              { label: "HRA Calculator", href: "/hra-calculator", icon: "🏦" },
            ].map((l) => (
              <Link key={l.href} to={l.href}
                className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-blue-100 transition text-sm font-semibold text-gray-700 border border-blue-100">
                <span>{l.icon}</span>{l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">More Articles</h3>
          <div className="space-y-3">
            {posts.filter(p => p.slug !== slug).map(p => (
              <Link key={p.slug} to={`/blog/${p.slug}`}
                className="block text-sm text-blue-600 hover:underline">
                {p.title} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}