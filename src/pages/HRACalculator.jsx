import { useState } from "react"
import { Helmet } from "react-helmet-async"

const format = (num) => (isFinite(num) && !isNaN(num) ? Math.round(num).toLocaleString("en-IN") : "0")
const formatL = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr"
  if (num >= 100000) return (num / 100000).toFixed(2) + " L"
  return format(num)
}
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

// Update this whenever the hardcoded tax slab / threshold figures below are refreshed.
const RATES_LAST_UPDATED = "September 2026"

const METRO_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai"]

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
            onChange={(e) => {
              const raw = e.target.value
              if (raw === "") { setValue(""); return }
              const n = Number(raw)
              if (isNaN(n)) return
              setValue(clamp(n, min, max))
            }}
            onBlur={() => { const n = Number(value); setValue(isNaN(n) ? min : clamp(n, min, max)) }}
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

// Shared HRA exemption math: returns the three components and the least-of-three exemption.
function calcHRA({ basic, da, hraReceived, rentPaid, isMetro }) {
  const salaryForHRA = basic + da
  const cityPct = isMetro ? 0.5 : 0.4
  const componentA = hraReceived
  const componentB = salaryForHRA * cityPct
  const componentC = Math.max(0, rentPaid - salaryForHRA * 0.1)
  const exemption = Math.max(0, Math.min(componentA, componentB, componentC))
  const taxable = Math.max(0, hraReceived - exemption)
  return { componentA, componentB, componentC, exemption, taxable, salaryForHRA }
}

/* ── Tab 1: HRA Calculator ── */
function HRATab() {
  const [basic, setBasic] = useState(40000)
  const [da, setDa] = useState(0)
  const [hraReceived, setHraReceived] = useState(20000)
  const [rentPaid, setRentPaid] = useState(18000)
  const [isMetro, setIsMetro] = useState(true)
  const [period, setPeriod] = useState("monthly") // monthly | annual

  const m = period === "monthly" ? 1 : 1 / 12
  const inputMult = period === "monthly" ? 1 : 12

  const { componentA, componentB, componentC, exemption, taxable, salaryForHRA } = calcHRA({
    basic: basic * inputMult, da: da * inputMult, hraReceived: hraReceived * inputMult, rentPaid: rentPaid * inputMult, isMetro,
  })

  const winner = exemption === componentC && componentC <= componentA && componentC <= componentB
    ? "Rent paid minus 10% of salary"
    : exemption === componentB && componentB <= componentA
    ? `${isMetro ? "50" : "40"}% of salary`
    : "Actual HRA received"

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Salary & Rent Details</h2>

        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Amounts entered as</label>
          <div className="grid grid-cols-2 gap-2">
            {["monthly", "annual"].map((p) => (
              <button key={p} type="button" onClick={() => setPeriod(p)}
                className={"px-3 py-2 rounded-lg text-sm font-semibold capitalize transition " + (period === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <SliderInput label={`Basic Salary (${period})`} value={basic} setValue={setBasic} min={5000} max={period === "monthly" ? 500000 : 6000000} step={1000} />
        <SliderInput label={`Dearness Allowance (${period})`} value={da} setValue={setDa} min={0} max={period === "monthly" ? 200000 : 2400000} step={500} />
        <SliderInput label={`HRA Received (${period})`} value={hraReceived} setValue={setHraReceived} min={0} max={period === "monthly" ? 300000 : 3600000} step={500} />
        <SliderInput label={`Rent Paid (${period})`} value={rentPaid} setValue={setRentPaid} min={0} max={period === "monthly" ? 300000 : 3600000} step={500} />

        <div className="mb-1">
          <label className="text-sm font-semibold text-gray-700 block mb-2">City Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setIsMetro(true)}
              className={"px-3 py-2 rounded-lg text-sm font-semibold transition " + (isMetro ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              Metro (50%)
            </button>
            <button type="button" onClick={() => setIsMetro(false)}
              className={"px-3 py-2 rounded-lg text-sm font-semibold transition " + (!isMetro ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              Non-Metro (40%)
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Metro = {METRO_CITIES.join(", ")}. All other cities count as non-metro.</p>
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-blue-100 text-sm mb-1">HRA Exemption (Annual)</p>
        <p className="text-4xl font-bold mb-1">₹{format(exemption / m)}</p>
        <p className="text-blue-200 text-sm mb-6">Lowest of the three components — driven by: {winner}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Actual HRA Received", value: `₹${formatL(componentA / m)}` },
            { label: `${isMetro ? "50" : "40"}% of Salary`, value: `₹${formatL(componentB / m)}` },
            { label: "Rent − 10% of Salary", value: `₹${formatL(componentC / m)}` },
            { label: "Taxable HRA", value: `₹${formatL(taxable / m)}` },
          ].map((r) => (
            <div key={r.label} className="bg-blue-700 rounded-xl p-3">
              <p className="text-blue-200 text-xs mb-1">{r.label}</p>
              <p className="text-white font-bold">{r.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-blue-500">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-100">Exempt</span>
            <span className="text-blue-100">Taxable</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-3">
            <div className="bg-white h-3 rounded-full" style={{ width: `${componentA ? (exemption / componentA) * 100 : 0}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-blue-200">{componentA ? Math.round((exemption / componentA) * 100) : 0}%</span>
            <span className="text-blue-200">{componentA ? Math.round((taxable / componentA) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-500">Basic + DA used for this calculation: <span className="font-semibold text-gray-700">₹{format(salaryForHRA / m)}/{period === "monthly" ? "month" : "year"}</span>. Special allowances and other salary components don't count toward "salary" for HRA purposes.</p>
      </div>
    </>
  )
}

/* ── Tab 2: Metro vs Non-Metro ── */
function CompareCityTab() {
  const [basic, setBasic] = useState(40000)
  const [da, setDa] = useState(0)
  const [hraReceived, setHraReceived] = useState(20000)
  const [rentPaid, setRentPaid] = useState(18000)

  const metro = calcHRA({ basic, da, hraReceived, rentPaid, isMetro: true })
  const nonMetro = calcHRA({ basic, da, hraReceived, rentPaid, isMetro: false })
  const diff = metro.exemption - nonMetro.exemption

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Metro vs Non-Metro (Monthly Figures)</h2>
        <p className="text-xs text-gray-400 mb-4">See how much more exemption you'd get if your city counted as metro rather than non-metro, for the same salary and rent.</p>
        <SliderInput label="Basic Salary (monthly)" value={basic} setValue={setBasic} min={5000} max={500000} step={1000} />
        <SliderInput label="Dearness Allowance (monthly)" value={da} setValue={setDa} min={0} max={200000} step={500} />
        <SliderInput label="HRA Received (monthly)" value={hraReceived} setValue={setHraReceived} min={0} max={300000} step={500} />
        <SliderInput label="Rent Paid (monthly)" value={rentPaid} setValue={setRentPaid} min={0} max={300000} step={500} />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-700">
          <span className="font-bold">Metro city gives ₹{format(diff)} more</span> exempt HRA per month than a non-metro city, for the same numbers.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {[
          { label: "Metro City", pct: "50%", data: metro, highlight: metro.exemption >= nonMetro.exemption },
          { label: "Non-Metro City", pct: "40%", data: nonMetro, highlight: nonMetro.exemption > metro.exemption },
        ].map((row) => (
          <div key={row.label} className={`bg-white rounded-2xl border p-4 shadow-sm ${row.highlight ? "border-green-300 bg-green-50" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-gray-800 text-sm">{row.label}</p>
                <p className="text-xs text-gray-400">City limit: {row.pct} of Basic + DA</p>
              </div>
              {row.highlight && <span className="text-xs font-semibold bg-green-600 text-white px-2 py-0.5 rounded-full">Higher Exemption</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Exempt</p>
                <p className="font-bold text-blue-600">₹{format(row.data.exemption)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Taxable</p>
                <p className="font-bold text-amber-600">₹{format(row.data.taxable)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">City Limit</p>
                <p className="font-bold text-gray-700">₹{format(row.data.componentB)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-6">Only Delhi, Mumbai, Kolkata and Chennai count as metro for HRA purposes — other large cities like Bengaluru, Hyderabad and Pune are treated as non-metro.</p>
    </>
  )
}

/* ── Tab 3: Old vs New Tax Regime ── */
function RegimeTab() {
  const [basic, setBasic] = useState(480000)
  const [da, setDa] = useState(0)
  const [hraReceived, setHraReceived] = useState(240000)
  const [rentPaid, setRentPaid] = useState(216000)
  const [isMetro, setIsMetro] = useState(true)
  const [slab, setSlab] = useState(20)

  const { exemption } = calcHRA({ basic, da, hraReceived, rentPaid, isMetro })
  const taxSaved = exemption * (slab / 100) * 1.04 // includes 4% cess

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">HRA Benefit: Old Regime Only</h2>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs text-gray-400">Annual figures. HRA exemption is available only under the old tax regime.</p>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            Checked: {RATES_LAST_UPDATED}
          </span>
        </div>
        <SliderInput label="Basic Salary (annual)" value={basic} setValue={setBasic} min={60000} max={6000000} step={5000} />
        <SliderInput label="Dearness Allowance (annual)" value={da} setValue={setDa} min={0} max={2400000} step={5000} />
        <SliderInput label="HRA Received (annual)" value={hraReceived} setValue={setHraReceived} min={0} max={3600000} step={5000} />
        <SliderInput label="Rent Paid (annual)" value={rentPaid} setValue={setRentPaid} min={0} max={3600000} step={5000} />

        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">City Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setIsMetro(true)}
              className={"px-3 py-2 rounded-lg text-sm font-semibold transition " + (isMetro ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              Metro
            </button>
            <button type="button" onClick={() => setIsMetro(false)}
              className={"px-3 py-2 rounded-lg text-sm font-semibold transition " + (!isMetro ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              Non-Metro
            </button>
          </div>
        </div>

        <div className="mb-1">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Your Income Tax Slab (Old Regime)</label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 20, 30].map((s) => (
              <button key={s} type="button" onClick={() => setSlab(s)}
                className={"px-3 py-2 rounded-lg text-sm font-semibold transition " + (slab === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {s}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-blue-100 text-sm mb-1">Estimated Tax Saved by Claiming HRA</p>
        <p className="text-4xl font-bold mb-1">₹{format(taxSaved)}</p>
        <p className="text-blue-200 text-sm">On ₹{format(exemption)} of exempt HRA, at your {slab}% slab plus 4% cess — old regime only.</p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-amber-700 mb-2">⚠️ Old vs New Regime</p>
        <div className="space-y-1 text-xs text-gray-600">
          <p>Old regime: HRA exemption available, along with deductions like 80C, 80D, and home loan interest.</p>
          <p>New regime (default since FY 2023-24): HRA exemption is not available, but slab rates are lower and a standard deduction still applies.</p>
          <p>Compare your total tax under both regimes before deciding — a high HRA exemption often tilts the choice toward the old regime, but not always.</p>
        </div>
      </div>
    </>
  )
}

/* ── FAQ ── */
function FaqSection() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: "What is HRA exemption under Section 10(13A)?", a: "House Rent Allowance (HRA) is part of your salary paid by your employer to help cover rent. Under Section 10(13A) of the Income Tax Act, a portion of it is exempt from tax — the exemption is the lowest of: actual HRA received, 50% (metro) or 40% (non-metro) of Basic + DA, or rent paid minus 10% of Basic + DA. The rest is added to your taxable income." },
    { q: "Which cities count as metro for HRA?", a: "For HRA purposes, only Delhi, Mumbai, Kolkata, and Chennai are treated as metro cities, giving a 50% limit. Every other city — including Bengaluru, Hyderabad, Pune, Ahmedabad, and Gurugram — is treated as non-metro, with a 40% limit." },
    { q: "Is HRA exemption available under the new tax regime?", a: "No. HRA exemption under Section 10(13A) is available only under the old tax regime. If you opt for the new tax regime (the default since FY 2023-24), your entire HRA is taxable, though you still get lower slab rates and a standard deduction." },
    { q: "Can I claim HRA exemption if I pay rent to my parents?", a: "Yes, this is allowed as long as it's a genuine arrangement — you actually pay rent, ideally by bank transfer, and your parents declare it as rental income in their tax return. You cannot claim HRA if you pay rent to your spouse, or if you own the house you live in." },
    { q: "What documents do I need to claim HRA?", a: "You typically need a rent receipt or rent agreement, and if annual rent exceeds ₹1,00,000, your landlord's PAN as well. Submit these to your employer during the year so HRA exemption is factored into your TDS, or claim it directly while filing your ITR." },
    { q: "What if my salary doesn't include an HRA component but I pay rent?", a: "If you don't receive HRA but pay rent — common for self-employed people or salaried employees without an HRA component — you can claim a deduction under Section 80GG instead, subject to its own limits (lowest of ₹5,000/month, 25% of total income, or rent minus 10% of total income)." },
    { q: "Can I claim both HRA exemption and home loan interest deduction?", a: "Yes, if the house you own is in a different city from where you live and work on rent, you can claim HRA exemption for the rented home and home loan interest deduction (Section 24) for the owned property, subject to the usual conditions." },
    { q: "What happens if my landlord doesn't have a PAN?", a: "If annual rent exceeds ₹1,00,000 and your landlord doesn't have a PAN, you can still claim HRA by submitting a declaration from the landlord stating they don't have a PAN, along with their name and address, though some employers may ask for additional proof." },
    { q: "Does DA (Dearness Allowance) count toward the HRA calculation?", a: "Yes, if your DA forms part of retirement benefits (common for government employees), it's included along with Basic Salary for computing the 40%/50% limit and the 10% rent threshold. For most private-sector employees, DA is usually zero or not applicable." },
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
      { "@type": "Question", name: "What is HRA exemption under Section 10(13A)?", acceptedAnswer: { "@type": "Answer", text: "HRA exemption is the lowest of: actual HRA received, 50% (metro) or 40% (non-metro) of Basic + DA, or rent paid minus 10% of Basic + DA. The rest of the HRA received is taxable." } },
      { "@type": "Question", name: "Which cities count as metro for HRA?", acceptedAnswer: { "@type": "Answer", text: "Only Delhi, Mumbai, Kolkata, and Chennai count as metro cities for HRA, giving a 50% limit. All other cities use the 40% non-metro limit." } },
      { "@type": "Question", name: "Is HRA exemption available under the new tax regime?", acceptedAnswer: { "@type": "Answer", text: "No, HRA exemption is available only under the old tax regime. Under the new tax regime, HRA received is fully taxable." } },
      { "@type": "Question", name: "What if my salary doesn't include HRA but I pay rent?", acceptedAnswer: { "@type": "Answer", text: "You can claim a deduction under Section 80GG instead, subject to a limit of the lowest of ₹5,000/month, 25% of total income, or rent minus 10% of total income." } },
    ]
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

function SeoContent() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Complete HRA Guide for India</h2>
      <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is House Rent Allowance?</h3>
          <p>House Rent Allowance (HRA) is a component of salary that employers pay to help employees cover rented accommodation. A part of it can be claimed as tax-exempt under Section 10(13A) of the Income Tax Act, provided the employee actually lives in rented housing and pays rent.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">How is HRA exemption calculated?</h3>
          <p>The exempt portion is the lowest of three amounts: the actual HRA received from your employer, 50% of Basic + DA for a metro city (40% for non-metro), and the rent you actually pay minus 10% of Basic + DA. Whatever HRA remains after this exemption is added to your taxable salary.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Metro vs non-metro cities</h3>
          <p>Only Delhi, Mumbai, Kolkata, and Chennai are classified as metro cities for HRA purposes, which raises the salary-based limit to 50%. Every other city in India — regardless of size — is treated as non-metro with a 40% limit, shown in the Compare tab above.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Tax regime matters for HRA</h3>
          <p>HRA exemption is only available if you choose the old tax regime while filing your return or declaring investments to your employer. Under the new tax regime, which is now the default, the full HRA amount is taxable, so compare your total tax liability under both regimes — factoring in HRA, 80C, and other deductions — before choosing. Thresholds and slab figures here were last checked in {RATES_LAST_UPDATED}; confirm current rules on the Income Tax Department's website before filing.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Main Export ── */
const TABS = [
  { id: "hra", label: "HRA Calculator" },
  { id: "city", label: "Metro vs Non-Metro" },
  { id: "regime", label: "Tax Saving" },
]

export default function HRACalculator() {
  const [tab, setTab] = useState("hra")

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>HRA Calculator India — House Rent Allowance Exemption | WebExt.in</title>
        <meta name="description" content="Free HRA calculator India. Calculate House Rent Allowance tax exemption under Section 10(13A), compare metro vs non-metro limits, and see how much tax you save. Instant results." />
      </Helmet>
      <FaqSchema />

      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</a>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HRA Calculator India</h1>
        <p className="text-gray-500 mb-6">Calculate your HRA tax exemption, compare metro vs non-metro city limits, and estimate the tax you save.</p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={"whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition " + (tab === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600")}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "hra" && <HRATab />}
        {tab === "city" && <CompareCityTab />}
        {tab === "regime" && <RegimeTab />}

        <FaqSection />
        <SeoContent />
      </div>
    </div>
  )
}