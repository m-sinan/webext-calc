import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { MarksCalculator as MarksCalculatorWidget, FaqAccordion, FaqSchema, RelatedCalculators } from "./PercentageShared"

const FAQS = [
  { q: "How to calculate percentage of marks?", a: "Percentage = (Marks Obtained / Total Marks) × 100. Example: 450 out of 600 = (450/600) × 100 = 75%." },
  { q: "What percentage is required for a first class?", a: "Requirements vary by board and university, but a first class typically starts around 60%, with distinction often starting at 75% or higher. Check your specific institution's grading rules to confirm." },
  { q: "How do I calculate marks needed for a target percentage?", a: "Required Marks = (Target Percentage / 100) × Total Marks. Example: To score 80% out of 600 total marks, you need (80/100) × 600 = 480 marks." },
  { q: "How is CGPA different from percentage?", a: "CGPA (Cumulative Grade Point Average) is typically on a 10-point scale, while percentage is out of 100. A common (though not universal) conversion used by some Indian boards is Percentage ≈ CGPA × 9.5." },
  { q: "What grade corresponds to what percentage?", a: "Grading scales vary by institution, but a common pattern is: 90%+ Outstanding, 80–89% Excellent, 70–79% Very Good, 60–69% Good, 50–59% Average, 40–49% Pass, below 40% Fail. The calculator above shows a grade alongside your percentage." },
]

export default function MarksCalculator() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>Marks Percentage Calculator — Get % and Grade Instantly | WebExt.in</title>
        <meta name="description" content="Free marks percentage calculator. Enter marks obtained and total marks to instantly see your percentage and grade. No signup needed." />
      </Helmet>
      <FaqSchema faqs={FAQS} />

      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marks Percentage Calculator</h1>
        <p className="text-gray-500 mb-8">Enter marks obtained and total marks to instantly see your percentage and grade.</p>

        <MarksCalculatorWidget />
        <FaqAccordion faqs={FAQS} />
        <RelatedCalculators exclude="/marks-percentage-calculator" />
      </div>
    </div>
  )
}