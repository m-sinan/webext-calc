import { Link } from "react-router-dom"
const tools = [
  {
    icon: "🏠",
    title: "Home Loan EMI",
    desc: "Calculate your monthly EMI for home loans instantly",
    tag: "Most Popular",
    tagColor: "bg-blue-100 text-blue-700",
    href: "/emi-calculator"
  },
  {
    icon: "💼",
    title: "In-Hand Salary",
    desc: "Know your exact take-home after PF, tax and deductions",
    tag: "Trending",
    tagColor: "bg-green-100 text-green-700",
    href: "/salary-calculator"
  },
  {
    icon: "🏦",
    title: "HRA Exemption",
    desc: "Calculate HRA tax exemption for metro and non-metro cities",
    tag: "Tax Saving",
    tagColor: "bg-purple-100 text-purple-700",
    href: "/hra-calculator"
  },
  {
    icon: "💰",
    title: "FD Calculator",
    desc: "See how much your fixed deposit will grow over time",
    tag: "Investment",
    tagColor: "bg-amber-100 text-amber-700",
    href: "/fd-calculator"
  },
  {
  icon: "💯",
  title: "Percentage Calculator",
  desc: "GST, discount, marks, increase/decrease — all percentage calculations",
  tag: "New",
  tagColor: "bg-red-100 text-red-700",
  href: "/percentage-calculator"
}
]

export default function Tools() {
  return (
    <section id="tools" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Pick Your Calculator</h2>
          <p className="text-gray-500 mt-2">All tools are free, instant, and built for India</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link
            key={tool.title}
              href={tool.href} className="group block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
              <div className="text-3xl mb-3">{tool.icon}</div>
              <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + tool.tagColor}>
                {tool.tag}
              </span>
              <h3 className="text-base font-bold text-gray-800 mt-3 mb-1 group-hover:text-blue-600 transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
              <div className="mt-4 text-blue-600 text-sm font-semibold">
                Calculate now →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}