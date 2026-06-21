import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import {
  PercentOfNumber,
  WhatPercent,
  AddPercent,
  RemovePercent,
  FaqAccordion,
  FaqSchema,
} from "./PercentageShared"

const FAQS = [
  { q: "What is 15% of 5000?", a: "15% of 5000 = (15/100) × 5000 = 750. Use our 'X% of Y' calculator above to calculate any percentage instantly." },
  { q: "How to calculate percentage increase?", a: "Percentage increase = ((New Value - Old Value) / Old Value) × 100. Example: From 400 to 500 = ((500-400)/400) × 100 = 25% increase." },
  { q: "How to calculate GST?", a: "To add GST: Total = Original × (1 + GST%/100). To remove GST from inclusive price: Original = Total / (1 + GST%/100). Our GST calculator does this instantly for 5%, 12%, 18%, and 28% rates." },
  { q: "What is 20% of 1 lakh?", a: "20% of 1,00,000 = (20/100) × 1,00,000 = ₹20,000. For any percentage of any number, use the calculator at the top of this page." },
  { q: "How to calculate discount percentage?", a: "Discount % = ((Original Price - Sale Price) / Original Price) × 100. Example: ₹2000 item selling for ₹1600 = ((2000-1600)/2000) × 100 = 20% discount." },
  { q: "How to calculate percentage of marks?", a: "Percentage = (Marks Obtained / Total Marks) × 100. Example: 450 out of 600 = (450/600) × 100 = 75%. Use the marks calculator to get grade as well." },
  { q: "What is percentage change formula?", a: "Percentage Change = ((New Value - Old Value) / |Old Value|) × 100. Positive result means increase, negative result means decrease." },
  { q: "How to calculate profit percentage?", a: "Profit % = (Profit / Cost Price) × 100. Profit = Selling Price - Cost Price. Example: Bought for ₹500, sold for ₹650. Profit = ₹150. Profit % = (150/500) × 100 = 30%." },
]

// Only calculators that live ON this page (no dedicated route)
const CALCULATOR_SECTIONS = [
  { id: "percent-of-y", label: "X% of Y" },
  { id: "what-percent", label: "X is what % of Y" },
  { id: "add-percent", label: "Add %" },
  { id: "remove-percent", label: "Remove %" },
]

// Calculators that have their own dedicated pages
const RELATED_CALCULATORS = [
  { label: "Discount Calculator", desc: "Find discount % or sale price", href: "/discount-calculator" },
  { label: "GST Calculator", desc: "Add or remove GST instantly", href: "/gst-calculator" },
  { label: "Percentage Increase / Decrease", desc: "Compare two values", href: "/percentage-increase-calculator" },
  { label: "Marks Percentage Calculator", desc: "Get % and grade from marks", href: "/marks-percentage-calculator" },
]

function CalculatorTabs() {
  const [active, setActive] = useState(CALCULATOR_SECTIONS[0].id)

  const handleClick = (id) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="mb-6 -mx-1 overflow-x-auto">
      <div className="flex gap-2 px-1 pb-1">
        {CALCULATOR_SECTIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => handleClick(c.id)}
            className={
              "px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap " +
              (active === c.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
            }
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function RelatedCalculators() {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Related Calculators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RELATED_CALCULATORS.map((c) => (
          <Link
            key={c.href}
            to={c.href}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition group"
          >
            <div>
              <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
            </div>
            <span className="text-gray-300 group-hover:text-blue-500 transition flex-shrink-0 ml-2 text-lg">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SeoContent() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Percentage Calculator — Complete Guide</h2>
      <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is percentage?</h3>
          <p>Percentage means "per hundred." It is a way of expressing a number as a fraction of 100. For example, 75% means 75 out of every 100. Percentages are used everywhere — from exam marks to GST, discounts, salary hikes, and bank interest rates.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Basic percentage formulas</h3>
          <p>X% of Y = (X/100) × Y. Percentage of X in Y = (X/Y) × 100. Percentage increase = ((New-Old)/Old) × 100. Percentage decrease = ((Old-New)/Old) × 100. These four formulas cover 90% of all percentage calculations in daily life.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">How to calculate GST in India</h3>
          <p>India has four main GST rates: 5% (essential goods), 12% (standard goods), 18% (most services and goods), and 28% (luxury items). To calculate GST: multiply the base price by the GST rate and divide by 100. To reverse calculate (find original price from GST-inclusive price): divide the total by (1 + GST rate/100).</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Percentage in salary and finance</h3>
          <p>Percentages are essential in Indian finance — your salary hike is a percentage, home loan interest is a percentage, FD returns are percentages, GST is a percentage, and income tax slabs are percentages. Understanding how to calculate percentages helps you make better financial decisions every day.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Main Export ── */
export default function PercentageCalculator() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>Percentage Calculator India — GST, Discount, Marks, Increase | WebExt.in</title>
        <meta name="description" content="Free percentage calculator India. Calculate X% of Y, percentage increase/decrease, GST, discount, marks percentage, and more. Instant results. No signup needed." />
      </Helmet>
      <FaqSchema faqs={FAQS} />

      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Percentage Calculator</h1>
        <p className="text-gray-500 mb-8">Quick percentage calculations — plus dedicated tools for GST, discount, marks and more below.</p>

        <CalculatorTabs />

        <div id="percent-of-y" className="scroll-mt-6">
          <PercentOfNumber />
        </div>
        <div id="what-percent" className="scroll-mt-6">
          <WhatPercent />
        </div>
        <div id="add-percent" className="scroll-mt-6">
          <AddPercent />
        </div>
        <div id="remove-percent" className="scroll-mt-6">
          <RemovePercent />
        </div>

        <RelatedCalculators />

        <FaqAccordion faqs={FAQS} />
        <SeoContent />
      </div>
    </div>
  )
}