import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { PercentChange, FaqAccordion, FaqSchema, RelatedCalculators } from "./PercentageShared"

const FAQS = [
  { q: "What is the percentage increase formula?", a: "Percentage Increase = ((New Value − Old Value) / Old Value) × 100. Example: From 400 to 500 = ((500−400)/400) × 100 = 25% increase." },
  { q: "What is the percentage decrease formula?", a: "Percentage Decrease = ((Old Value − New Value) / Old Value) × 100. Example: From 500 to 400 = ((500−400)/500) × 100 = 20% decrease." },
  { q: "Why are percentage increase and decrease not symmetric?", a: "Because the formula always divides by the original value, not the new one. A 25% increase from 400 to 500 is undone by a 20% decrease from 500 back to 400 — not another 25% decrease." },
  { q: "How do I calculate a salary hike percentage?", a: "Salary Hike % = ((New Salary − Old Salary) / Old Salary) × 100. Example: Salary raised from ₹40,000 to ₹46,000 is a ((46000−40000)/40000) × 100 = 15% hike." },
  { q: "What does a negative percentage change mean?", a: "A negative result means the value decreased. For example, a result of −10% means the new value is 10% lower than the original value." },
]

export default function PercentageIncreaseCalculator() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>Percentage Increase / Decrease Calculator — Instant % Change | WebExt.in</title>
        <meta name="description" content="Free percentage increase and decrease calculator. Enter the original and new value to instantly see the % change — useful for salary hikes, price changes, and more." />
      </Helmet>
      <FaqSchema faqs={FAQS} />

      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Percentage Increase / Decrease Calculator</h1>
        <p className="text-gray-500 mb-8">Enter an original and a new value to instantly see the percentage change between them — increase or decrease.</p>

        <PercentChange />
        <FaqAccordion faqs={FAQS} />
        <RelatedCalculators exclude="/percentage-increase-calculator" />
      </div>
    </div>
  )
}