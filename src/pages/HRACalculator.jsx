import { useState } from "react"
import { Helmet } from "react-helmet-async"

const format = (num) => (isFinite(num) && !isNaN(num) ? Math.round(num).toLocaleString("en-IN") : "0")

function SliderInput({ label, value, setValue, min, max, step, prefix = "₹", suffix = "" }) {
  return (
    <div className="mb-5">
      <label className="text-sm font-semibold text-gray-700 block mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => setValue(Number(e.target.value))} className="flex-1 accent-blue-600" />
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden min-w-[120px]">
          {prefix && <span className="px-2 text-gray-400 text-sm bg-gray-50 border-r border-gray-200">{prefix}</span>}
          <input type="number" value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => { const n = Number(value); setValue(n < min ? min : n > max ? max : n) }}
            className="w-full px-2 py-1.5 text-sm text-gray-700 focus:outline-none" />
          {suffix && <span className="px-2 text-gray-400 text-sm bg-gray-50 border-l border-gray-200">{suffix}</span>}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{prefix}{Number(min).toLocaleString("en-IN")}{suffix}</span>
        <span>{prefix}{Number(max).toLocaleString("en-IN")}{suffix}</span>
      </div>
    </div>
  )
}

function FaqSection() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: "What is HRA exemption?", a: "HRA (House Rent Allowance) exemption is the portion of HRA you receive from your employer that is not taxable. The exemption is the minimum of three conditions: actual HRA received, 50% of basic salary (metro) or 40% (non-metro), and rent paid minus 10% of basic salary." },
    { q: "Which cities are considered metro for HRA?", a: "Only four cities are classified as metro for HRA purposes under Indian income tax rules: Mumbai, Delhi, Kolkata, and Chennai. All other cities including Bangalore, Hyderabad, Pune, Ahmedabad are considered non-metro even though they are large cities." },
    { q: "Can I claim HRA without rent receipts?", a: "If your annual rent is below ₹1 lakh, rent receipts are not mandatory but advisable to keep. If annual rent exceeds ₹1 lakh, you must provide rent receipts AND your landlord's PAN to your employer for HRA exemption." },
    { q: "Can I claim HRA if I live in my own house?", a: "No. HRA exemption is only available if you are actually paying rent for accommodation. If you live in your own house, you cannot claim HRA exemption. However, you can claim home loan interest deduction under Section 24(b) instead." },
    { q: "Can I claim HRA and home loan together?", a: "Yes, in certain cases. If you own a house in one city but work and rent in another city, you can claim both HRA exemption (for the rent you pay) and home loan interest deduction (for the house you own). This is a legitimate and legal tax saving strategy." },
    { q: "What if my landlord does not have a PAN?", a: "If your landlord does not have a PAN and annual rent exceeds ₹1 lakh, you must submit a declaration from the landlord stating they do not have a PAN. Without this, your employer may deduct TDS on the full HRA amount." },
    { q: "Is HRA fully taxable if I don't pay rent?", a: "Yes. If you receive HRA from your employer but do not actually live in a rented house, the entire HRA amount is added to your taxable income. HRA exemption is only available when you genuinely pay rent." },
    { q: "How do I claim HRA in my income tax return?", a: "Declare your HRA exemption when submitting investment proofs to your employer — they will adjust your TDS accordingly. If you missed it, claim it directly in your ITR under Section 10(13A). Keep rent receipts and rental agreement as proof." },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-900 text-xl mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition">
              <span className="text-sm font-semibold text-gray-800 pr-4">{faq.q}</span>
              <span className="text-blue-600 text-lg flex-shrink-0">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function FaqSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Which cities are metro for HRA exemption?", acceptedAnswer: { "@type": "Answer", text: "Only Mumbai, Delhi, Kolkata, and Chennai are metro cities for HRA. Bangalore, Hyderabad, Pune are non-metro." } },
      { "@type": "Question", name: "Can I claim HRA without rent receipts?", acceptedAnswer: { "@type": "Answer", text: "Rent receipts are not mandatory if annual rent is below ₹1 lakh. Above ₹1 lakh, rent receipts and landlord PAN are required." } },
      { "@type": "Question", name: "Can I claim HRA and home loan deduction together?", acceptedAnswer: { "@type": "Answer", text: "Yes, if you own a house in one city but rent in another city for work, you can claim both HRA exemption and home loan interest deduction." } },
    ]
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

function SeoContent() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Complete HRA Exemption Guide India 2025</h2>
      <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is HRA and how does exemption work?</h3>
          <p>HRA (House Rent Allowance) is a component of your salary given by your employer to cover rental expenses. The Indian Income Tax Act allows you to claim exemption on part or all of this HRA under Section 10(13A), reducing your taxable income significantly.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">The three conditions for HRA exemption</h3>
          <p>Your HRA exemption is the minimum of these three amounts: (1) Actual HRA received from employer, (2) 50% of basic salary if you live in Mumbai, Delhi, Kolkata or Chennai — 40% for all other cities, (3) Actual rent paid minus 10% of basic salary. The lowest of these three is your tax-free HRA.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Metro vs Non-Metro — why it matters</h3>
          <p>For HRA calculation, only four cities are classified as metro: Mumbai, Delhi, Kolkata, and Chennai. In metro cities, 50% of basic salary is used in the HRA formula. For all other cities including Bangalore, Hyderabad, Pune, and Ahmedabad, only 40% of basic salary is used — resulting in lower HRA exemption.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">HRA exemption is only in Old Tax Regime</h3>
          <p>HRA exemption under Section 10(13A) is only available if you choose the Old Tax Regime. Under the New Tax Regime (lower slab rates), you cannot claim HRA exemption. If your HRA exemption is large, the Old Regime may save you more tax overall — use our Income Tax calculator to compare.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Documents needed to claim HRA</h3>
          <p>Submit rent receipts to your employer every year before the investment proof deadline (usually January–February). For rent above ₹1 lakh per year (₹8,334 per month), also provide your landlord's PAN. Keep your rental agreement as backup proof in case of IT scrutiny.</p>
        </div>
      </div>
    </div>
  )
}

export default function HRACalculator() {
  const [basic, setBasic] = useState(30000)
  const [hra, setHra] = useState(15000)
  const [rent, setRent] = useState(12000)
  const [isMetro, setIsMetro] = useState(true)

  const metroPercent = isMetro ? 0.5 : 0.4
  const condition1 = Number(hra)
  const condition2 = Number(basic) * metroPercent
  const condition3 = Math.max(0, Number(rent) - Number(basic) * 0.1)
  const exemption = Math.min(condition1, condition2, condition3)
  const taxableHRA = Number(hra) - exemption
  const annualExemption = exemption * 12
  const annualTaxableHRA = taxableHRA * 12

  const metroThreshold = Number(basic) * 0.1
  const rentAdequate = Number(rent) > metroThreshold

  const cities = {
    metro: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
    nonMetro: ["Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Kochi", "All other cities"]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>HRA Exemption Calculator India 2025 — Metro & Non-Metro | WebExt.in</title>
        <meta name="description" content="Calculate your HRA tax exemption instantly. Know how much HRA is tax-free vs taxable based on metro/non-metro city, basic salary and rent paid. Free HRA calculator India 2025." />
      </Helmet>
      <FaqSchema />

      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</a>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HRA Exemption Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate your exact HRA tax exemption as per Indian income tax rules</p>

        {/* City type */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">Your Details</h2>

          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-2">City Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: true, label: "Metro City", sub: "Mumbai, Delhi, Kolkata, Chennai" },
                { val: false, label: "Non-Metro City", sub: "Bangalore, Hyderabad, Pune & others" },
              ].map((o) => (
                <button key={String(o.val)} type="button" onClick={() => setIsMetro(o.val)}
                  className={"p-3 rounded-xl border-2 text-left transition " + (isMetro === o.val ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200")}>
                  <p className={`text-sm font-bold ${isMetro === o.val ? "text-blue-700" : "text-gray-700"}`}>{o.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <SliderInput label="Basic Salary (monthly)" value={basic} setValue={setBasic} min={5000} max={500000} step={1000} />
          <SliderInput label="HRA Received (monthly)" value={hra} setValue={setHra} min={1000} max={300000} step={500} />
          <SliderInput label="Rent Paid (monthly)" value={rent} setValue={setRent} min={0} max={300000} step={500} />

          {!rentAdequate && rent > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
              <p className="text-xs text-amber-700">⚠️ Your rent (₹{format(rent)}) is less than 10% of basic salary (₹{format(metroThreshold)}). This means Condition 3 = ₹0, so your HRA exemption may be zero or very low.</p>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6">
          <p className="text-blue-100 text-sm mb-1">Monthly HRA Exemption</p>
          <p className="text-4xl font-bold mb-1">₹{format(exemption)}</p>
          <p className="text-blue-200 text-sm mb-6">₹{format(annualExemption)} tax-free annually</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Taxable HRA (monthly)", value: `₹${format(taxableHRA)}` },
              { label: "Taxable HRA (annual)", value: `₹${format(annualTaxableHRA)}` },
              { label: "HRA Received", value: `₹${format(hra)}/mo` },
              { label: "City Type", value: isMetro ? "Metro (50%)" : "Non-Metro (40%)" },
            ].map((r) => (
              <div key={r.label} className="bg-blue-700 rounded-xl p-3">
                <p className="text-blue-200 text-xs mb-1">{r.label}</p>
                <p className="text-white font-bold">{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 conditions breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-1">How Your Exemption is Calculated</h3>
          <p className="text-xs text-gray-400 mb-4">HRA exemption = minimum of these 3 conditions</p>
          <div className="space-y-3">
            {[
              { label: "Condition 1 — Actual HRA received", value: condition1, formula: `₹${format(hra)} (as received)` },
              { label: `Condition 2 — ${isMetro ? "50%" : "40%"} of Basic salary`, value: condition2, formula: `₹${format(basic)} × ${isMetro ? "50" : "40"}% = ₹${format(condition2)}` },
              { label: "Condition 3 — Rent paid minus 10% of Basic", value: condition3, formula: `₹${format(rent)} − ₹${format(basic * 0.1)} = ₹${format(condition3)}` },
            ].map((c, i) => (
              <div key={i} className={`p-4 rounded-xl border-2 ${c.value === exemption ? "border-green-300 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm font-semibold ${c.value === exemption ? "text-green-700" : "text-gray-700"}`}>{c.label}</p>
                  <p className={`text-lg font-bold ${c.value === exemption ? "text-green-600" : "text-gray-600"}`}>₹{format(c.value)}</p>
                </div>
                <p className="text-xs text-gray-400">{c.formula}</p>
                {c.value === exemption && <p className="text-xs text-green-600 font-semibold mt-1">✓ This is the minimum — your exemption amount</p>}
              </div>
            ))}
          </div>
        </div>

        {/* City reference table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Metro vs Non-Metro City List</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Metro Cities (50% of Basic)</p>
              <div className="space-y-1">
                {cities.metro.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Non-Metro (40% of Basic)</p>
              <div className="space-y-1">
                {cities.nonMetro.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-blue-800 mb-3">💡 Tips to Maximize HRA Exemption</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {[
              "Pay rent via bank transfer — creates a paper trail for IT department if questioned.",
              "If rent is above ₹8,334/month (₹1L/year), collect landlord's PAN — mandatory.",
              "You can pay rent to parents and claim HRA — but parents must declare it as rental income.",
              "HRA exemption is only available in Old Tax Regime. Compare both regimes before choosing.",
              "Even if your employer doesn't show HRA in salary slip, you can claim it directly in ITR.",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <FaqSection />
        <SeoContent />
      </div>
    </div>
  )
}