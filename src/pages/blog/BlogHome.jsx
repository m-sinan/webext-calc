import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { posts } from "./posts/index"

const categoryColors = {
  "Home Loan": "bg-blue-100 text-blue-700",
  "Salary": "bg-green-100 text-green-700",
  "Investment": "bg-amber-100 text-amber-700",
  "Tax": "bg-purple-100 text-purple-700",
}

export default function BlogHome() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>Finance Blog India — EMI, Salary, Investment Tips | WebExt.in</title>
        <meta name="description" content="Free finance articles for India. Learn about home loan EMI, in-hand salary, FD vs SIP, HRA exemption and more. Simple, practical money advice for Indians." />
        <link rel="canonical" href="https://webext.in/blog" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Blog</h1>
        <p className="text-gray-500 mb-10">Simple, practical money articles for Indians — no jargon, just clear answers.</p>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (categoryColors[post.category] || "bg-gray-100 text-gray-600")}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">{post.description}</p>
              <p className="text-blue-600 text-sm font-semibold mt-3">Read more →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}