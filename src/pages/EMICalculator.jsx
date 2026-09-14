import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"

const format = (num) => (isFinite(num) && !isNaN(num) ? Math.round(num).toLocaleString("en-IN") : "0")
const formatL = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr"
  if (num >= 100000) return (num / 100000).toFixed(2) + " L"
  return format(num)
}
const formatTenure = (months) => {
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m} months`
  if (m === 0) return `${y} years`
  return `${y}yr ${m}mo`
}

/* ── Shared UI ── */
function SliderInput({ label, value, setValue, min, max, step, prefix = "₹", suffix = "", hint = "" }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => setValue(Number(e.target.value))} className="flex-1 accent-blue-600" />
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden min-w-[130px]">
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

function calcEMI(principal, annualRate, months) {
  if (annualRate === 0) return principal / months
  const r = annualRate / 12 / 100
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function buildSchedule(principal, annualRate, months) {
  const r = annualRate / 12 / 100
  const emi = calcEMI(principal, annualRate, months)
  let balance = principal
  const rows = []
  for (let i = 1; i <= months && balance > 0; i++) {
    const interest = balance * r
    const principalPart = Math.min(emi - interest, balance)
    balance = Math.max(0, balance - principalPart)
    rows.push({ month: i, emi, interest, principal: principalPart, balance })
  }
  return rows
}

/* ── Loan Type Config ── */
const LOAN_TYPES = {
  home: {
    label: "Home Loan",
    defaultAmount: 2500000,
    defaultRate: 8.5,
    defaultTenure: 240,
    maxAmount: 50000000,
    maxTenure: 360,
    minRate: 7,
    color: "blue",
  },
  car: {
    label: "Car Loan",
    defaultAmount: 800000,
    defaultRate: 9.5,
    defaultTenure: 60,
    maxAmount: 5000000,
    maxTenure: 84,
    minRate: 7,
    color: "green",
  },
  personal: {
    label: "Personal Loan",
    defaultAmount: 500000,
    defaultRate: 14,
    defaultTenure: 36,
    maxAmount: 5000000,
    maxTenure: 60,
    minRate: 10,
    color: "purple",
  },
}

/* ── Copy to clipboard ── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={handleCopy}
      className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition">
      {copied ? "✅ Copied!" : "📋 Copy Result"}
    </button>
  )
}

/* ── Tab 1: EMI Calculator ── */
function EmiTab() {
  const [loanType, setLoanType] = useState("home")
  const [loan, setLoan] = useState(LOAN_TYPES.home.defaultAmount)
  const [rate, setRate] = useState(LOAN_TYPES.home.defaultRate)
  const [tenure, setTenure] = useState(LOAN_TYPES.home.defaultTenure)
  const [showFull, setShowFull] = useState(false)
  const [showReverse, setShowReverse] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState(25000)
  const [reverseRate, setReverseRate] = useState(8.5)
  const [reverseTenure, setReverseTenure] = useState(240)

  const config = LOAN_TYPES[loanType]

  const handleLoanTypeChange = (type) => {
    setLoanType(type)
    setLoan(LOAN_TYPES[type].defaultAmount)
    setRate(LOAN_TYPES[type].defaultRate)
    setTenure(LOAN_TYPES[type].defaultTenure)
  }

  const emi = calcEMI(loan, rate, tenure)
  const totalPayment = emi * tenure
  const totalInterest = totalPayment - loan
  const schedule = useMemo(() => buildSchedule(loan, rate, tenure), [loan, rate, tenure])
  const displayRows = showFull ? schedule : schedule.slice(0, 12)

  // Reverse EMI — max loan from monthly budget
  const rR = reverseRate / 12 / 100
  const maxLoan = rR > 0
    ? monthlyBudget * (Math.pow(1 + rR, reverseTenure) - 1) / (rR * Math.pow(1 + rR, reverseTenure))
    : monthlyBudget * reverseTenure

  const copyText = `EMI Calculator Result (WebExt.in)
Loan Amount: ₹${format(loan)}
Interest Rate: ${rate}%
Tenure: ${formatTenure(tenure)}
Monthly EMI: ₹${format(emi)}
Total Interest: ₹${formatL(totalInterest)}
Total Payment: ₹${formatL(totalPayment)}`

  return (
    <>
      {/* Loan Type Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Select Loan Type</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {Object.entries(LOAN_TYPES).map(([key, val]) => (
            <button key={key} type="button" onClick={() => handleLoanTypeChange(key)}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition ${loanType === key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"}`}>
              {val.label}
            </button>
          ))}
        </div>

        <SliderInput label="Loan Amount" value={loan} setValue={setLoan}
          min={100000} max={config.maxAmount} step={50000} />
        <SliderInput label="Interest Rate (per year)" value={rate} setValue={setRate}
          min={config.minRate} max={25} step={0.1} prefix="" suffix="%" />
        <SliderInput
          label="Loan Tenure"
          value={tenure}
          setValue={setTenure}
          min={6}
          max={config.maxTenure}
          step={1}
          prefix=""
          suffix=" mo"
          hint={formatTenure(tenure)}
        />
      </div>

      {/* Result */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-4">
        <p className="text-blue-100 text-sm mb-1">Monthly EMI</p>
        <p className="text-4xl font-bold mb-6">₹{format(emi)}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Principal Amount", value: formatL(loan) },
            { label: "Total Interest", value: formatL(totalInterest) },
            { label: "Total Payment", value: formatL(totalPayment) },
            { label: "Tenure", value: formatTenure(tenure) },
          ].map((r) => (
            <div key={r.label} className="bg-blue-700 rounded-xl p-3">
              <p className="text-blue-200 text-xs mb-1">{r.label}</p>
              <p className="text-white font-bold">₹{r.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-4 border-t border-blue-500">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-100">Principal {Math.round((loan / totalPayment) * 100)}%</span>
            <span className="text-blue-100">Interest {Math.round((totalInterest / totalPayment) * 100)}%</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-3">
            <div className="bg-white h-3 rounded-full" style={{ width: `${(loan / totalPayment) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Copy Result */}
      <div className="flex justify-end mb-6">
        <CopyButton text={copyText} />
      </div>

      {/* Reverse EMI Calculator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <button type="button" onClick={() => setShowReverse(!showReverse)}
          className="w-full flex justify-between items-center">
          <div>
            <p className="font-bold text-gray-800 text-left">🔄 Reverse EMI Calculator</p>
            <p className="text-xs text-gray-400 text-left mt-0.5">What loan amount can I afford with my monthly budget?</p>
          </div>
          <span className="text-blue-600 text-lg">{showReverse ? "−" : "+"}</span>
        </button>

        {showReverse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <SliderInput label="Monthly EMI Budget" value={monthlyBudget} setValue={setMonthlyBudget}
              min={1000} max={500000} step={1000} />
            <SliderInput label="Expected Interest Rate" value={reverseRate} setValue={setReverseRate}
              min={5} max={25} step={0.1} prefix="" suffix="%" />
            <SliderInput label="Loan Tenure" value={reverseTenure} setValue={setReverseTenure}
              min={6} max={360} step={1} prefix="" suffix=" mo" hint={formatTenure(reverseTenure)} />
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-2">
              <p className="text-sm text-gray-600 mb-1">Maximum Loan You Can Afford</p>
              <p className="text-3xl font-bold text-green-600">₹{formatL(maxLoan)}</p>
              <p className="text-xs text-gray-400 mt-1">At ₹{format(monthlyBudget)}/mo EMI for {formatTenure(reverseTenure)} at {reverseRate}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Amortization Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Loan Amortization Schedule</h3>
        <p className="text-xs text-gray-400 mb-4">Month by month breakdown of principal vs interest</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-semibold">Month</th>
                <th className="pb-2 font-semibold">EMI</th>
                <th className="pb-2 font-semibold text-red-400">Interest</th>
                <th className="pb-2 font-semibold text-green-600">Principal</th>
                <th className="pb-2 font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {displayRows.map((row) => (
                <tr key={row.month} className="border-b border-gray-50">
                  <td className="py-2">{row.month}</td>
                  <td className="py-2">₹{format(row.emi)}</td>
                  <td className="py-2 text-red-500">₹{format(row.interest)}</td>
                  <td className="py-2 text-green-600">₹{format(row.principal)}</td>
                  <td className="py-2">₹{format(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {schedule.length > 12 && (
          <button onClick={() => setShowFull(!showFull)}
            className="mt-4 text-blue-600 text-sm font-semibold hover:underline">
            {showFull ? "Show less ↑" : `Show all ${schedule.length} months ↓`}
          </button>
        )}
      </div>
    </>
  )
}

/* ── Tab 2: Prepayment Calculator ── */
function PrepaymentTab() {
  const [loan, setLoan] = useState(2500000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(240)
  const [prepayMonth, setPrepayMonth] = useState(12)
  const [prepayAmount, setPrepayAmount] = useState(100000)
  const [prepayType, setPrepayType] = useState("reduce_tenure")

  const emi = calcEMI(loan, rate, tenure)
  const totalWithout = emi * tenure
  const interestWithout = totalWithout - loan

  const scheduleWithout = buildSchedule(loan, rate, tenure)
  const balanceAtPrepay = scheduleWithout[prepayMonth - 1]?.balance || loan
  const newPrincipal = Math.max(0, balanceAtPrepay - prepayAmount)
  const remainingMonths = tenure - prepayMonth

  let newEMI = emi
  let newTenure = remainingMonths
  if (prepayType === "reduce_tenure") {
    newTenure = Math.ceil(Math.log(emi / (emi - newPrincipal * rate / 12 / 100)) / Math.log(1 + rate / 12 / 100))
    newEMI = emi
  } else {
    newEMI = calcEMI(newPrincipal, rate, remainingMonths)
    newTenure = remainingMonths
  }

  const interestAfterPrepay = (newEMI * newTenure) - newPrincipal
  const interestBeforePrepay = scheduleWithout.slice(0, prepayMonth).reduce((s, r) => s + r.interest, 0)
  const totalInterestWith = interestBeforePrepay + Math.max(0, interestAfterPrepay)
  const interestSaving = Math.max(0, interestWithout - totalInterestWith - prepayAmount)
  const monthsSaved = tenure - (prepayMonth + newTenure)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Loan Prepayment Calculator</h2>
        <SliderInput label="Original Loan Amount" value={loan} setValue={setLoan} min={100000} max={50000000} step={50000} />
        <SliderInput label="Interest Rate" value={rate} setValue={setRate} min={5} max={25} step={0.1} prefix="" suffix="%" />
        <SliderInput label="Original Tenure" value={tenure} setValue={setTenure} min={12} max={360} step={1} prefix="" suffix=" mo" hint={formatTenure(tenure)} />
        <SliderInput label="Prepayment in Month No." value={prepayMonth} setValue={setPrepayMonth} min={1} max={tenure - 1} step={1} prefix="" suffix="" hint={`Month ${prepayMonth} of ${tenure}`} />
        <SliderInput label="Prepayment Amount" value={prepayAmount} setValue={setPrepayAmount} min={10000} max={loan} step={10000} />
        <div className="mt-2">
          <label className="text-sm font-semibold text-gray-700 block mb-2">After prepayment, I want to:</label>
          <div className="flex gap-3">
            {[
              { val: "reduce_tenure", label: "✅ Reduce tenure (saves more)" },
              { val: "reduce_emi", label: "Reduce monthly EMI" },
            ].map((o) => (
              <button key={o.val} type="button" onClick={() => setPrepayType(o.val)}
                className={"flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition " + (prepayType === o.val ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-green-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-green-100 text-sm mb-1">Total Interest Saved</p>
        <p className="text-4xl font-bold mb-4">₹{format(Math.max(0, interestSaving))}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Time Saved", value: monthsSaved > 0 ? formatTenure(monthsSaved) : "0 months" },
            { label: prepayType === "reduce_emi" ? "New Monthly EMI" : "EMI (unchanged)", value: `₹${format(newEMI)}` },
            { label: "Interest Without Prepay", value: `₹${formatL(interestWithout)}` },
            { label: "Interest With Prepay", value: `₹${formatL(totalInterestWith)}` },
          ].map((r) => (
            <div key={r.label} className="bg-green-700 rounded-xl p-3">
              <p className="text-green-200 text-xs mb-1">{r.label}</p>
              <p className="text-white font-bold">{r.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-amber-700 mb-2">💡 Key Insight</p>
        <p className="text-sm text-gray-600">
          Prepaying ₹{formatL(prepayAmount)} in month {prepayMonth} saves{" "}
          <span className="font-bold text-green-600">₹{format(Math.max(0, interestSaving))}</span> in interest — that's a{" "}
          <span className="font-bold">{prepayAmount > 0 ? Math.round((Math.max(0, interestSaving) / prepayAmount) * 100) : 0}% return</span> on your prepayment. The earlier you prepay, the more you save.
        </p>
      </div>
    </>
  )
}

/* ── Tab 3: Close Faster ── */
function ClosureTab() {
  const [loan, setLoan] = useState(2500000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(240)
  const [extraEMIPerYear, setExtraEMIPerYear] = useState(1)
  const [annualEMIIncrease, setAnnualEMIIncrease] = useState(5)

  const emi = calcEMI(loan, rate, tenure)
  const totalInterestNormal = emi * tenure - loan
  const extraMonthlyEquivalent = (emi * extraEMIPerYear) / 12
  const newEMI1 = emi + extraMonthlyEquivalent
  const r = rate / 12 / 100
  const newTenure1 = r > 0 ? Math.ceil(Math.log(newEMI1 / (newEMI1 - loan * r)) / Math.log(1 + r)) : tenure
  const saving1 = totalInterestNormal - (newEMI1 * newTenure1 - loan)
  const monthsSaved1 = tenure - newTenure1

  let balance2 = loan
  let months2 = 0
  let totalPaid2 = 0
  let currentEMI2 = emi
  while (balance2 > 0 && months2 < 600) {
    if (months2 > 0 && months2 % 12 === 0) currentEMI2 *= (1 + annualEMIIncrease / 100)
    const interest = balance2 * r
    const principal = Math.min(currentEMI2 - interest, balance2)
    balance2 = Math.max(0, balance2 - principal)
    totalPaid2 += currentEMI2
    months2++
  }
  const saving2 = Math.max(0, totalInterestNormal - (totalPaid2 - loan))
  const monthsSaved2 = tenure - months2

  const tips = [
    { icon: "📅", title: "Pay extra EMIs every year", desc: `Paying ${extraEMIPerYear} extra EMI per year on your ₹${formatL(loan)} loan saves ₹${formatL(Math.max(0, saving1))} and closes the loan ${formatTenure(Math.max(0, monthsSaved1))} early.`, highlight: true },
    { icon: "📈", title: `Step up EMI by ${annualEMIIncrease}% every year`, desc: `As your salary grows, increase your EMI annually. A ${annualEMIIncrease}% yearly step-up saves ₹${formatL(saving2)} and closes your loan ${formatTenure(Math.max(0, monthsSaved2))} early.`, highlight: true },
    { icon: "🎯", title: "Use bonus for prepayment", desc: "RBI rules: Banks CANNOT charge prepayment penalty on floating rate home loans. Put every bonus toward the loan — it reduces principal directly.", highlight: false },
    { icon: "⚡", title: "Prepay early for maximum savings", desc: "₹1 lakh prepaid in year 1 saves 3-4x more than ₹1 lakh prepaid in year 10. In early years, 80% of your EMI goes to interest — prepay early to beat this.", highlight: false },
    { icon: "🏦", title: "Switch to a lower interest rate", desc: "If rates drop by 0.5%+, consider a balance transfer. Processing fee of ₹5,000-15,000 is worth it on large loans where savings can be in lakhs.", highlight: false },
    { icon: "📋", title: "Always choose tenure reduction", desc: "When prepaying, choose 'reduce tenure' not 'reduce EMI'. You save far more interest by closing faster.", highlight: false },
    { icon: "🔒", title: "Get NOC after full closure", desc: "After full loan repayment, collect NOC from bank, get original property documents back, and get a closure letter to update CIBIL.", highlight: false },
  ]

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Close Your Loan Faster</h2>
        <SliderInput label="Loan Amount" value={loan} setValue={setLoan} min={100000} max={50000000} step={50000} />
        <SliderInput label="Interest Rate" value={rate} setValue={setRate} min={5} max={25} step={0.1} prefix="" suffix="%" />
        <SliderInput label="Tenure" value={tenure} setValue={setTenure} min={12} max={360} step={1} prefix="" suffix=" mo" hint={formatTenure(tenure)} />
        <SliderInput label="Extra EMIs per year" value={extraEMIPerYear} setValue={setExtraEMIPerYear} min={1} max={6} step={1} prefix="" suffix="" />
        <SliderInput label="Annual EMI step-up %" value={annualEMIIncrease} setValue={setAnnualEMIIncrease} min={1} max={20} step={1} prefix="" suffix="%" />
      </div>

      <div className="space-y-4 mb-6">
        {tips.map((tip) => (
          <div key={tip.title} className={`rounded-2xl p-5 border ${tip.highlight ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <h3 className={`font-bold mb-1 ${tip.highlight ? "text-blue-800" : "text-gray-800"}`}>{tip.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-green-800 mb-2">⚖️ RBI Rules You Must Know</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span><span className="font-semibold">No prepayment penalty</span> on floating rate home loans — RBI banned this in 2012.</span></div>
          <div className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span><span className="font-semibold">Fixed rate loans</span> may have penalty — check your loan agreement before prepaying.</span></div>
          <div className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span><span className="font-semibold">Part prepayment</span> must reduce principal, not future EMIs. Ask your bank for a revised schedule.</span></div>
          <div className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span><span className="font-semibold">After full closure</span> — bank must return original documents within 30 days per RBI rules.</span></div>
        </div>
      </div>
    </>
  )
}

/* ── Tab 4: Compare Banks ── */
const BANK_DATA = {
  home: [
    { name: "Bank of Baroda", rate: 8.4, logo: "🟡", special: "Lowest rate for eligible borrowers" },
    { name: "SBI", rate: 8.5, logo: "🏛️", special: "Best for salaried govt employees" },
    { name: "PNB Housing", rate: 8.5, logo: "🟢", special: "Good for tier 2/3 cities" },
    { name: "LIC Housing", rate: 8.5, logo: "⚪", special: "Popular for long tenure loans" },
    { name: "Kotak Mahindra", rate: 8.7, logo: "🔴", special: "Good for high CIBIL score" },
    { name: "HDFC Bank", rate: 8.75, logo: "🔵", special: "Fast processing, self-employed friendly" },
    { name: "ICICI Bank", rate: 8.75, logo: "🟠", special: "Good balance transfer offers" },
    { name: "Axis Bank", rate: 8.75, logo: "🟣", special: "Flexible tenure options" },
  ],
  car: [
    { name: "SBI", rate: 8.85, logo: "🏛️", special: "Lowest for existing SBI customers" },
    { name: "Bank of Baroda", rate: 8.9, logo: "🟡", special: "Competitive rates for new cars" },
    { name: "HDFC Bank", rate: 9.0, logo: "🔵", special: "Fast approval, wide dealer network" },
    { name: "ICICI Bank", rate: 9.1, logo: "🟠", special: "Good for pre-owned cars too" },
    { name: "Axis Bank", rate: 9.25, logo: "🟣", special: "Flexible EMI options" },
    { name: "Kotak Mahindra", rate: 9.5, logo: "🔴", special: "Good for self-employed" },
  ],
  personal: [
    { name: "SBI", rate: 11.45, logo: "🏛️", special: "Best for govt/PSU employees" },
    { name: "Bank of Baroda", rate: 12.0, logo: "🟡", special: "Good for existing customers" },
    { name: "HDFC Bank", rate: 10.85, logo: "🔵", special: "Pre-approved offers for customers" },
    { name: "ICICI Bank", rate: 10.85, logo: "🟠", special: "Instant disbursal for salaried" },
    { name: "Axis Bank", rate: 11.25, logo: "🟣", special: "Flexible repayment options" },
    { name: "Kotak Mahindra", rate: 10.99, logo: "🔴", special: "Good for high credit score" },
  ],
}

function CompareBanksTab() {
  const [loanType, setLoanType] = useState("home")
  const [loanAmount, setLoanAmount] = useState(2500000)
  const [tenure, setTenure] = useState(240)

  const config = LOAN_TYPES[loanType]
  const banks = BANK_DATA[loanType]

  const handleTypeChange = (type) => {
    setLoanType(type)
    setLoanAmount(LOAN_TYPES[type].defaultAmount)
    setTenure(LOAN_TYPES[type].defaultTenure)
  }

  const withEMI = banks.map((b) => ({
    ...b,
    emi: calcEMI(loanAmount, b.rate, tenure),
    totalInterest: calcEMI(loanAmount, b.rate, tenure) * tenure - loanAmount
  })).sort((a, b) => a.rate - b.rate)

  const best = withEMI[0]
  const worst = withEMI[withEMI.length - 1]

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Compare Bank Loan Rates</h2>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {Object.entries(LOAN_TYPES).map(([key, val]) => (
            <button key={key} type="button" onClick={() => handleTypeChange(key)}
              className={`py-2 rounded-xl text-sm font-semibold border-2 transition ${loanType === key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"}`}>
              {val.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-4">⚠️ Indicative rates only — actual rates vary by credit score and income. Always confirm with the bank before applying.</p>
        <SliderInput label="Loan Amount" value={loanAmount} setValue={setLoanAmount} min={100000} max={config.maxAmount} step={50000} />
        <SliderInput label="Tenure" value={tenure} setValue={setTenure} min={6} max={config.maxTenure} step={1} prefix="" suffix=" mo" hint={formatTenure(tenure)} />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-700">
          <span className="font-bold">Lowest: {best.name}</span> at {best.rate}% — ₹{format(best.emi)}/mo.
          You save ₹{formatL(worst.totalInterest - best.totalInterest)} vs highest rate option.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {withEMI.map((bank, i) => (
          <div key={bank.name} className={`bg-white rounded-2xl border p-4 shadow-sm ${i === 0 ? "border-green-300 bg-green-50" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{bank.logo}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{bank.name}</p>
                  <p className="text-xs text-gray-400">{bank.special}</p>
                </div>
              </div>
              {i === 0 && <span className="text-xs font-semibold bg-green-600 text-white px-2 py-0.5 rounded-full">Lowest</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Rate</p>
                <p className="font-bold text-gray-800">{bank.rate}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Monthly EMI</p>
                <p className="font-bold text-blue-600">₹{format(bank.emi)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Total Interest</p>
                <p className="font-bold text-red-500">₹{formatL(bank.totalInterest)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-amber-700 mb-2">💡 Tips to Get the Best Rate</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">CIBIL score 750+</span> gets you lowest rates — check free on CIBIL website before applying.</span></div>
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">Salary account bank</span> often gives 0.1–0.25% lower rate to existing customers.</span></div>
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">Women co-applicants</span> get 0.05–0.1% discount at most banks for home loans.</span></div>
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">Negotiate</span> — banks have flexibility, especially with large down payments.</span></div>
        </div>
      </div>
    </>
  )
}

/* ── FAQ Section ── */
function FaqSection() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: "How is EMI calculated manually?", a: "EMI is calculated using the formula EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the total number of monthly instalments. For example, on a ₹25 lakh loan at 8.5% for 20 years, r = 0.007083 and n = 240 — plugging these into the formula gives a monthly EMI of roughly ₹21,696. You can verify any figure by working through the formula step by step, or use the EMI calculator above to get the result instantly." },
    { q: "Does pre-payment reduce EMI or loan tenure?", a: "It depends on the option you choose with your bank. Most lenders let you pick: reduce the loan tenure (your EMI stays the same, but the loan closes earlier) or reduce the EMI (your tenure stays the same, but each future instalment is smaller). Reducing tenure usually saves more total interest because the principal is paid off faster. Use the Prepayment tab above to compare both outcomes for your exact loan." },
    { q: "What is the formula for calculating loan EMI?", a: "The standard EMI calculation formula used by Indian banks and NBFCs is: EMI = P × r × (1+r)^n / ((1+r)^n − 1). Here, P is the principal (loan amount), r is the monthly interest rate, and n is the loan tenure in months. This is the same EMI calculation formula our home loan EMI calculator, car loan EMI calculator, and personal loan EMI calculator all use under the hood." },
    { q: "What is the EMI for a 20 lakh home loan?", a: "For a ₹20 lakh home loan at 8.5% interest for 20 years, the EMI is approximately ₹17,356 per month. Use the free EMI calculator above to adjust for your exact loan amount, rate, and tenure." },
    { q: "What happens if I miss an EMI?", a: "Missing an EMI adds a late payment fee (typically 2% of overdue amount), negatively impacts your CIBIL score, and the bank may mark the account as NPA after 90 days. Contact your bank immediately for a restructuring option." },
    { q: "Can I reduce my EMI after taking a loan?", a: "Yes. You can reduce EMI by making a part prepayment, switching to a lower interest rate through balance transfer, or renegotiating rate with your existing bank if RBI repo rate has fallen." },
    { q: "Should I prepay my home loan or invest in SIP?", a: "If your home loan rate is 8.5% and equity mutual funds return 12%, SIP gives higher return mathematically. But prepaying gives guaranteed tax-free return equal to your interest rate. Best strategy: prepay aggressively early years, shift to SIP later." },
    { q: "Can the bank charge prepayment penalty on home loan?", a: "No. RBI prohibits prepayment penalty on floating rate home loans. Fixed rate loans may have a penalty — check your loan agreement before making a large prepayment." },
    { q: "What is the maximum home loan I can get?", a: "Banks give up to 80% of property value. Your EMI should not exceed 40–50% of your net monthly income. Minimum CIBIL score required is usually 700–750." },
    { q: "What happens to home loan if I lose my job?", a: "Immediately inform your bank. Most banks offer EMI moratorium for 3–6 months for genuine hardship. Loan insurance (if taken) may cover EMIs in case of job loss." },
    { q: "Is home loan interest tax deductible?", a: "Yes. Under Section 24(b), interest up to ₹2 lakh per year is deductible. Principal repayment up to ₹1.5 lakh qualifies under Section 80C. Only available in Old Tax Regime." },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-900 text-xl mb-4">Frequently Asked Questions — EMI Calculator</h2>
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

/* ── SEO Content ── */
function SeoContent() {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">EMI Calculation Formula</h2>
        <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
          <p>Every EMI calculator — whether for a home loan, car loan, or personal loan — uses the same underlying EMI calculation formula:</p>
          <p className="font-mono text-gray-700 bg-gray-50 rounded-lg px-4 py-3 text-center text-sm">
            EMI = P × r × (1 + r)<sup>n</sup> / ((1 + r)<sup>n</sup> − 1)
          </p>
          <p>Where <span className="font-semibold text-gray-700">P</span> is the principal loan amount, <span className="font-semibold text-gray-700">r</span> is the monthly interest rate (annual rate ÷ 12 ÷ 100), and <span className="font-semibold text-gray-700">n</span> is the loan tenure in months. Each EMI instalment is a mix of interest and principal — in the early months, a larger share goes toward interest, and this gradually shifts toward principal as the balance reduces.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Home Loan EMI Calculator</h2>
        <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
          <p>Our home loan EMI calculator helps you work out the monthly instalment on a housing loan of up to ₹5 crore, with tenures stretching as long as 30 years. Home loans typically carry the lowest interest rates of any retail loan in India — usually in the 8–9% range — because they're secured against the property.</p>
          <p>Enter your loan amount, expected interest rate, and tenure in the calculator above to instantly see your monthly EMI, total interest payable, and a full amortization schedule. You can also compare current home loan rates across major banks in the Compare Banks tab, or model how prepayments shorten your tenure in the Prepayment tab.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Car Loan EMI Calculator</h2>
        <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
          <p>Use the car loan EMI calculator to estimate your monthly payment on a new or used vehicle loan. Car loans usually run for 5–7 years at interest rates between 9% and 12%, and most banks finance up to 85–90% of the on-road price for new cars.</p>
          <p>Switch to the "Car Loan" option in the calculator above to see EMI, interest, and total repayment for your vehicle loan amount, or check the Compare Banks tab to line up rates from SBI, HDFC, ICICI, and others side by side.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Loan EMI Calculator</h2>
        <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
          <p>The personal loan EMI calculator is built for unsecured loans with shorter tenures — typically 1 to 5 years — and higher interest rates, usually 10–24% depending on your credit score and income profile. Because personal loans need no collateral, lenders price them higher than home or car loans.</p>
          <p>Select "Personal Loan" in the calculator above to see your exact monthly EMI and total interest outgo, and use the Close Faster tab to see how extra payments or an annual step-up in EMI can help you clear the loan sooner.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">More on EMI &amp; Loan Planning</h2>
        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">What is a Good EMI to Income Ratio?</h3>
            <p>Banks allow EMI up to 40–50% of net monthly income. Financial advisors recommend keeping all EMIs below 35% of in-hand salary, leaving enough for living expenses, savings, and emergencies.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Floating vs Fixed Interest Rate — Which is Better?</h3>
            <p>Floating rates (linked to RBI repo rate) are lower and reduce when RBI cuts rates. Fixed rates give certainty but are 1–2% higher. For long tenure loans (15–20 years), floating rate is generally better in India.</p>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── JSON-LD Schema: WebApplication + FAQPage (single @graph) ── */
function PageSchema() {
  const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "WebExt EMI Calculator",
      "url": "https://www.webext.in/emi-calculator",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How is EMI calculated manually?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EMI is calculated using the formula: P x R x (1+R)^N / [(1+R)^N - 1], where P is Principal loan amount, R is monthly interest rate, and N is tenure in months."
          }
        },
        {
          "@type": "Question",
          "name": "Does pre-payment reduce EMI or loan tenure?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Making a loan pre-payment reduces your principal balance. You can choose to either lower your monthly EMI amount or shorten your overall loan tenure."
          }
        }
      ]
    }
  ]
}
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

/* ── Main ── */
const TABS = [
  { id: "emi", label: "EMI Calculator" },
  { id: "prepayment", label: "Prepayment" },
  { id: "closure", label: "Close Faster" },
  { id: "banks", label: "Compare Banks" },
]

export default function EMICalculator() {
  const [tab, setTab] = useState("emi")

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>Free EMI Calculator India - Calculate Home, Car & Personal Loan EMI | WebExt</title>
        <meta name="description" content="Calculate monthly loan EMI, total interest, and repayment schedules instantly for home, car, and personal loans in India. 100% free with no login required." />
        <link rel="canonical" href="https://www.webext.in/emi-calculator" />
      </Helmet>
      <PageSchema />

      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</a>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EMI Calculator — Home Loan, Car & Personal Loan</h1>
        <p className="text-gray-500 mb-6">Free online loan EMI calculator India. Calculate EMI, plan prepayments, compare bank rates, and close your loan faster.</p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={"whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition " + (tab === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600")}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "emi" && <EmiTab />}
        {tab === "prepayment" && <PrepaymentTab />}
        {tab === "closure" && <ClosureTab />}
        {tab === "banks" && <CompareBanksTab />}

        <SeoContent />
        <FaqSection />
      </div>
    </div>
  )
}