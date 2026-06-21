import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { DiscountCalculator as DiscountCalculatorWidget, FaqAccordion, FaqSchema, RelatedCalculators } from "./PercentageShared"

const FAQS = [
  { q: "How to calculate discount percentage?", a: "Discount % = ((Original Price - Sale Price) / Original Price) × 100. Example: ₹2000 item selling for ₹1600 = ((2000-1600)/2000) × 100 = 20% discount." },
  { q: "How do I find the final price after a discount?", a: "Final Price = Original Price − (Original Price × Discount% / 100). Example: ₹2000 with 20% off = 2000 − (2000 × 0.20) = ₹1600." },
  { q: "How much do I save on a discounted item?", a: "Savings = Original Price × (Discount% / 100). Example: ₹2000 at 20% off saves you ₹400." },
  { q: "How do I calculate the original price from a discounted price?", a: "Original Price = Discounted Price / (1 − Discount%/100). Example: ₹1600 after a 20% discount means the original price was 1600 / 0.80 = ₹2000." },
  { q: "What is the difference between flat discount and percentage discount?", a: "A flat discount subtracts a fixed rupee amount regardless of price. A percentage discount scales with the price — a higher MRP item saves more rupees at the same percentage off." },
]

export default function DiscountCalculator() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>Discount Calculator — Find Sale Price & Savings Instantly | WebExt.in</title>
        <meta name="description" content="Free online discount calculator. Enter the original price and discount percentage to instantly see the final price and how much you save. No signup needed." />
      </Helmet>
      <FaqSchema faqs={FAQS} />

      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discount Calculator</h1>
        <p className="text-gray-500 mb-8">Enter the original price and discount percentage to see the final price and your total savings instantly.</p>

        <DiscountCalculatorWidget />
        <FaqAccordion faqs={FAQS} />
        <RelatedCalculators exclude="/discount-calculator" />
      </div>
    </div>
  )
}