import { useState } from "react"
import { Helmet } from "react-helmet-async"

const format = (num) => (isFinite(num) && !isNaN(num) ? Math.round(num).toLocaleString("en-IN") : "0")
const formatL = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr"
  if (num >= 100000) return (num / 100000).toFixed(2) + " L"
  return format(num)
}

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

/* ── Tab 1: FD Calculator ── */
function FDTab() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(3)
  const [compounding, setCompounding] = useState("quarterly")
  const [isSenior, setIsSenior] = useState(false)

  const seniorBonus = isSenior ? 0.5 : 0
  const effectiveRate = rate + seniorBonus

  const nMap = { annually: 1, "half-yearly": 2, quarterly: 4, monthly: 12 }
  const n = nMap[compounding]
  const maturity = principal * Math.pow(1 + effectiveRate / 100 / n, n * years)
  const interest = maturity - principal
  const effectiveYield = ((maturity / principal) ** (1 / years) - 1) * 100

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">FD Details</h2>
        <SliderInput label="Principal Amount" value={principal} setValue={setPrincipal} min={10000} max={10000000} step={10000} />
        <SliderInput label="Interest Rate (per year)" value={rate} setValue={setRate} min={3} max={10} step={0.1} prefix="" suffix="%" />
        <SliderInput label="Tenure" value={years} setValue={setYears} min={1} max={10} step={1} prefix="" suffix=" yrs" />

        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Compounding Frequency</label>
          <div className="grid grid-cols-2 gap-2">
            {["annually", "half-yearly", "quarterly", "monthly"].map((c) => (
              <button key={c} type="button" onClick={() => setCompounding(c)}
                className={"px-3 py-2 rounded-lg text-sm font-semibold capitalize transition " + (compounding === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={isSenior} onChange={(e) => setIsSenior(e.target.checked)} className="accent-blue-600" />
          Senior Citizen (extra 0.5% interest rate)
        </label>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-blue-100 text-sm mb-1">Maturity Amount</p>
        <p className="text-4xl font-bold mb-1">₹{format(maturity)}</p>
        <p className="text-blue-200 text-sm mb-6">After {years} year{years > 1 ? "s" : ""} at {effectiveRate}% {isSenior ? "(senior citizen rate)" : ""}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Principal Invested", value: `₹${formatL(principal)}` },
            { label: "Interest Earned", value: `₹${formatL(interest)}` },
            { label: "Effective Annual Yield", value: `${effectiveYield.toFixed(2)}%` },
            { label: "Compounding", value: compounding },
          ].map((r) => (
            <div key={r.label} className="bg-blue-700 rounded-xl p-3">
              <p className="text-blue-200 text-xs mb-1">{r.label}</p>
              <p className="text-white font-bold capitalize">{r.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-blue-500">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-100">Principal</span>
            <span className="text-blue-100">Interest</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-3">
            <div className="bg-white h-3 rounded-full" style={{ width: `${(principal / maturity) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-blue-200">{Math.round((principal / maturity) * 100)}%</span>
            <span className="text-blue-200">{Math.round((interest / maturity) * 100)}%</span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Tab 2: Compare Banks ── */
function CompareBanksTab() {
  const [principal, setPrincipal] = useState(100000)
  const [years, setYears] = useState(3)
  const [isSenior, setIsSenior] = useState(false)

  const banks = [
    { name: "SBI", general: 6.8, senior: 7.3, logo: "🏛️", note: "Most trusted, DICGC insured" },
    { name: "HDFC Bank", general: 7.0, senior: 7.5, logo: "🔵", note: "Good rates, digital process" },
    { name: "ICICI Bank", general: 7.0, senior: 7.5, logo: "🟠", note: "Easy online booking" },
    { name: "Axis Bank", general: 7.1, senior: 7.6, logo: "🟣", note: "Competitive senior rates" },
    { name: "Kotak Mahindra", general: 7.1, senior: 7.6, logo: "🔴", note: "Good for 811 account holders" },
    { name: "Bank of Baroda", general: 6.85, senior: 7.35, logo: "🟡", note: "PSU bank, safe and reliable" },
    { name: "Post Office (POTD)", general: 7.5, senior: 7.5, logo: "📮", note: "Government backed, highest safety" },
    { name: "Small Finance Banks*", general: 8.5, senior: 9.0, logo: "🏦", note: "Higher rates, higher risk. DICGC covers up to ₹5L only" },
  ]

  const calc = (rate) => {
    const n = 4
    return principal * Math.pow(1 + rate / 100 / n, n * years)
  }

  const withMaturity = banks.map((b) => ({
    ...b,
    rate: isSenior ? b.senior : b.general,
    maturity: calc(isSenior ? b.senior : b.general),
    interest: calc(isSenior ? b.senior : b.general) - principal,
  })).sort((a, b) => b.rate - a.rate)

  const best = withMaturity[0]

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Compare FD Rates</h2>
        <p className="text-xs text-gray-400 mb-4">Indicative rates for {years}-year FD as of June 2025. Confirm with bank before booking.</p>
        <SliderInput label="Principal Amount" value={principal} setValue={setPrincipal} min={10000} max={10000000} step={10000} />
        <SliderInput label="Tenure" value={years} setValue={setYears} min={1} max={5} step={1} prefix="" suffix=" yrs" />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={isSenior} onChange={(e) => setIsSenior(e.target.checked)} className="accent-blue-600" />
          Senior Citizen (60+ years)
        </label>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-700">
          <span className="font-bold">Best rate: {best.name}</span> at {best.rate}% — maturity ₹{format(best.maturity)}, interest earned ₹{format(best.interest)}.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {withMaturity.map((bank, i) => (
          <div key={bank.name} className={`bg-white rounded-2xl border p-4 shadow-sm ${i === 0 ? "border-green-300 bg-green-50" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{bank.logo}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{bank.name}</p>
                  <p className="text-xs text-gray-400">{bank.note}</p>
                </div>
              </div>
              {i === 0 && <span className="text-xs font-semibold bg-green-600 text-white px-2 py-0.5 rounded-full">Highest</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Rate</p>
                <p className="font-bold text-gray-800">{bank.rate}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Maturity</p>
                <p className="font-bold text-blue-600">₹{format(bank.maturity)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Interest</p>
                <p className="font-bold text-green-600">₹{format(bank.interest)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-6">*Small Finance Banks offer higher rates but carry more risk. DICGC insurance covers deposits up to ₹5 lakh per bank per depositor including interest.</p>
    </>
  )
}

/* ── Tab 3: FD vs Other Investments ── */
function CompareInvestmentsTab() {
  const [principal, setPrincipal] = useState(100000)
  const [years, setYears] = useState(5)

  const fdRate = 7.0
  const ppfRate = 7.1
  const nscRate = 7.7
  const rdRate = 6.8
  const sipReturn = 12.0
  const goldReturn = 8.0

  const calcCI = (p, r, y) => p * Math.pow(1 + r / 100, y)
  const calcSIP = (monthly, r, months) => {
    const mr = r / 12 / 100
    return monthly * ((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr)
  }

  const monthlyEquivalent = principal / 12

  const options = [
    { name: "Bank FD", returns: calcCI(principal, fdRate, years), rate: fdRate, risk: "Very Low", taxable: true, lock: "Premature withdrawal allowed with penalty", icon: "🏦" },
    { name: "PPF", returns: calcCI(principal, ppfRate, years), rate: ppfRate, risk: "Zero (Govt)", taxable: false, lock: "15 year lock-in, partial withdrawal after 7 years", icon: "🏛️" },
    { name: "NSC", returns: calcCI(principal, nscRate, years), rate: nscRate, risk: "Zero (Govt)", taxable: true, lock: "5 year lock-in, no premature withdrawal", icon: "📮" },
    { name: "SIP (Mutual Fund)*", returns: calcSIP(monthlyEquivalent, sipReturn, years * 12), rate: sipReturn, risk: "Medium-High", taxable: true, lock: "No lock-in (except ELSS — 3 years)", icon: "📈" },
    { name: "Gold (approx)*", returns: calcCI(principal, goldReturn, years), rate: goldReturn, risk: "Medium", taxable: true, lock: "No lock-in for digital gold/ETF", icon: "🪙" },
  ].sort((a, b) => b.returns - a.returns)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">FD vs Other Investments</h2>
        <p className="text-xs text-gray-400 mb-4">Compare where ₹{format(principal)} grows more over {years} years. SIP uses monthly equivalent of ₹{format(Math.round(monthlyEquivalent))}.</p>
        <SliderInput label="Investment Amount" value={principal} setValue={setPrincipal} min={10000} max={1000000} step={10000} />
        <SliderInput label="Time Period" value={years} setValue={setYears} min={1} max={15} step={1} prefix="" suffix=" yrs" />
      </div>

      <div className="space-y-3 mb-6">
        {options.map((opt, i) => (
          <div key={opt.name} className={`bg-white rounded-2xl border p-4 shadow-sm ${i === 0 ? "border-blue-300 bg-blue-50" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{opt.icon}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{opt.name}</p>
                  <p className="text-xs text-gray-400">Risk: {opt.risk} | {opt.taxable ? "Interest taxable" : "Tax-free returns"}</p>
                </div>
              </div>
              {i === 0 && <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">Best Return</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Rate</p>
                <p className="font-bold text-gray-800">{opt.rate}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Maturity</p>
                <p className="font-bold text-blue-600">₹{format(opt.returns)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Gain</p>
                <p className="font-bold text-green-600">₹{format(opt.returns - principal)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">🔒 {opt.lock}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-amber-700 mb-2">⚠️ Important Notes</p>
        <div className="space-y-1 text-xs text-gray-600">
          <p>*SIP returns are estimated at 12% historical average — actual returns vary and are not guaranteed.</p>
          <p>*Gold returns estimated at 8% long-term average — actual prices fluctuate significantly.</p>
          <p>FD, PPF, NSC returns are guaranteed. Mutual fund and gold returns are market-linked.</p>
        </div>
      </div>
    </>
  )
}

/* ── FAQ ── */
function FaqSection() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: "Is FD interest taxable in India?", a: "Yes. FD interest is fully taxable as 'Income from Other Sources' at your income tax slab rate. Banks deduct TDS at 10% if annual interest exceeds ₹40,000 (₹50,000 for senior citizens). If your total income is below the taxable limit, submit Form 15G (or 15H for seniors) to avoid TDS." },
    { q: "What is the maximum FD amount insured in India?", a: "DICGC (Deposit Insurance and Credit Guarantee Corporation) insures bank deposits up to ₹5 lakh per depositor per bank — including both principal and interest. This covers savings, FD, RD, and current accounts combined. For amounts above ₹5 lakh, consider spreading across multiple banks." },
    { q: "Can I break my FD before maturity?", a: "Yes, most banks allow premature FD withdrawal. Banks typically charge a penalty of 0.5% to 1% on the applicable interest rate. For example, if the 3-year rate is 7% and you withdraw in year 2, the bank may pay the 2-year rate (say 6.75%) minus the penalty — resulting in 5.75% to 6.25%." },
    { q: "What is the difference between cumulative and non-cumulative FD?", a: "Cumulative FD: Interest compounds and is paid at maturity along with principal. Better for wealth building as you get compound interest benefit. Non-cumulative FD: Interest is paid at regular intervals (monthly, quarterly, half-yearly). Better if you need regular income, like for retired people." },
    { q: "Should I invest in FD or SIP?", a: "FD gives guaranteed returns (6.5-8%), zero risk, and is ideal for short-term goals or emergency funds. SIP in mutual funds can give 10-14% over long term but with market risk. Ideal strategy: keep 3-6 months emergency fund in FD, invest surplus in SIP for long-term goals above 5 years." },
    { q: "Do senior citizens get higher FD rates?", a: "Yes. All major banks offer 0.25% to 0.75% extra interest rate for senior citizens (age 60+) on FDs. Some banks offer even higher rates for super senior citizens (age 80+). Post Office deposits give same rate regardless of age." },
    { q: "What is Tax Saver FD?", a: "Tax Saver FD is a 5-year fixed deposit that qualifies for deduction under Section 80C up to ₹1.5 lakh. The lock-in period is mandatory 5 years — premature withdrawal is not allowed. Interest earned is taxable. It's useful if you've exhausted other 80C options like PF and PPF." },
    { q: "Which is safer — bank FD or post office FD?", a: "Post Office FD is backed by the Government of India making it 100% safe with no limit on insurance. Bank FDs are insured by DICGC up to ₹5 lakh only. Post Office FD rates are also competitive (7.5% for 5-year). For amounts above ₹5 lakh, Post Office FD is considered safer." },
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
      { "@type": "Question", name: "Is FD interest taxable in India?", acceptedAnswer: { "@type": "Answer", text: "Yes. FD interest is taxable at your income slab rate. Banks deduct TDS at 10% if interest exceeds ₹40,000 per year (₹50,000 for senior citizens)." } },
      { "@type": "Question", name: "What is the maximum FD amount insured in India?", acceptedAnswer: { "@type": "Answer", text: "DICGC insures up to ₹5 lakh per depositor per bank including principal and interest. For amounts above ₹5 lakh, spread across multiple banks." } },
      { "@type": "Question", name: "Should I invest in FD or SIP?", acceptedAnswer: { "@type": "Answer", text: "FD for short-term and emergency fund (guaranteed returns). SIP for long-term wealth building (higher returns but market risk). Ideal: 3-6 months in FD, rest in SIP." } },
    ]
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

function SeoContent() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Complete FD Guide for India 2025</h2>
      <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is a Fixed Deposit?</h3>
          <p>A Fixed Deposit (FD) is a financial instrument offered by banks and post offices where you deposit a lump sum for a fixed period at a predetermined interest rate. It is one of the safest investment options in India, offering guaranteed returns regardless of market conditions.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">How is FD interest calculated?</h3>
          <p>FD interest is calculated using compound interest: Maturity = P × (1 + r/n)^(n×t), where P is principal, r is annual rate, n is compounding frequency per year, and t is tenure in years. Quarterly compounding gives slightly higher returns than annual compounding at the same rate.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">FD interest rates in India 2025</h3>
          <p>FD rates in India currently range from 6.5% to 9% depending on the bank and tenure. Government banks like SBI offer 6.5-7.1%. Private banks like HDFC, ICICI offer 6.75-7.25%. Small Finance Banks offer 8-9% with higher risk. Senior citizens get 0.25-0.75% extra across all banks.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Tax on FD interest — what you need to know</h3>
          <p>FD interest is added to your total income and taxed at your applicable slab rate. If you are in the 30% bracket, you pay 30% tax on FD interest. To avoid TDS deduction, submit Form 15G (below 60 years) or Form 15H (senior citizens) at the start of each financial year if your total income is below the taxable limit.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Main Export ── */
const TABS = [
  { id: "fd", label: "FD Calculator" },
  { id: "banks", label: "Compare Banks" },
  { id: "compare", label: "FD vs SIP vs PPF" },
]

export default function FDCalculator() {
  const [tab, setTab] = useState("fd")

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>FD Calculator India 2025 — Fixed Deposit, Bank Rates, FD vs SIP | WebExt.in</title>
        <meta name="description" content="Free FD calculator India. Calculate fixed deposit maturity, compare bank rates (SBI, HDFC, ICICI), senior citizen rates, and compare FD vs SIP vs PPF. Instant results 2025." />
      </Helmet>
      <FaqSchema />

      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</a>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FD Calculator India</h1>
        <p className="text-gray-500 mb-6">Calculate FD maturity, compare bank rates, and see how FD compares to SIP and PPF.</p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={"whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition " + (tab === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600")}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "fd" && <FDTab />}
        {tab === "banks" && <CompareBanksTab />}
        {tab === "compare" && <CompareInvestmentsTab />}

        <FaqSection />
        <SeoContent />
      </div>
    </div>
  )
}