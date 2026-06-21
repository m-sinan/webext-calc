import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { GSTCalculator as GSTCalculatorWidget, FaqAccordion, FaqSchema, RelatedCalculators } from "./PercentageShared"

const FAQS = [
  { q: "How to calculate GST?", a: "To add GST: Total = Original × (1 + GST%/100). To remove GST from an inclusive price: Original = Total / (1 + GST%/100). The calculator above does this instantly for 5%, 12%, 18%, and 28% rates." },
  { q: "What are the GST rates in India?", a: "India has four main GST slabs: 5% for essential goods, 12% for standard goods, 18% for most services and goods, and 28% for luxury and sin items." },
  { q: "What is the difference between CGST and SGST?", a: "For intra-state sales, GST is split equally into CGST (Central GST) and SGST (State GST) — so 18% GST means 9% CGST + 9% SGST. For inter-state sales, the full amount is charged as IGST instead." },
  { q: "How do I remove GST from a price that already includes it?", a: "Use the 'Remove GST' mode above. The formula is: Base Price = Total Price / (1 + GST Rate/100). Example: ₹1180 with 18% GST included means the base price was 1180 / 1.18 = ₹1000." },
  { q: "Is GST calculated on MRP?", a: "MRP (Maximum Retail Price) in India is generally inclusive of GST. To find the base price and GST component within an MRP, use the 'Remove GST' mode above." },
]

export default function GSTCalculator() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>GST Calculator — Add or Remove GST Instantly (5%, 12%, 18%, 28%) | WebExt.in</title>
        <meta name="description" content="Free GST calculator for India. Add GST to a base price or remove GST from an inclusive price at 5%, 12%, 18%, or 28% rates. Instant results, no signup needed." />
      </Helmet>
      <FaqSchema faqs={FAQS} />

      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GST Calculator</h1>
        <p className="text-gray-500 mb-8">Add GST to a base price, or remove GST from a price that already includes it — for any of India's GST rates.</p>

        <GSTCalculatorWidget />
        <FaqAccordion faqs={FAQS} />
        <RelatedCalculators exclude="/gst-calculator" />
      </div>
    </div>
  )
}