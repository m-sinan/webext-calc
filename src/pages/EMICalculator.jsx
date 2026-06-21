import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"

const format = (num) => (isFinite(num) && !isNaN(num) ? Math.round(num).toLocaleString("en-IN") : "0")
const formatL = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr"
  if (num >= 100000) return (num / 100000).toFixed(2) + " L"
  return format(num)
}

/* ── Shared UI ── */
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

/* ── Tab 1: EMI Calculator ── */
function EmiTab() {
  const [loan, setLoan] = useState(2500000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(240)
  const [showFull, setShowFull] = useState(false)

  const emi = calcEMI(loan, rate, tenure)
  const totalPayment = emi * tenure
  const totalInterest = totalPayment - loan
  const schedule = useMemo(() => buildSchedule(loan, rate, tenure), [loan, rate, tenure])
  const displayRows = showFull ? schedule : schedule.slice(0, 12)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Loan Details</h2>
        <SliderInput label="Loan Amount" value={loan} setValue={setLoan} min={100000} max={10000000} step={50000} />
        <SliderInput label="Interest Rate (per year)" value={rate} setValue={setRate} min={5} max={20} step={0.1} prefix="" suffix="%" />
        <SliderInput label="Loan Tenure" value={tenure} setValue={setTenure} min={12} max={360} step={12} prefix="" suffix=" mo" />
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-blue-100 text-sm mb-1">Monthly EMI</p>
        <p className="text-4xl font-bold mb-6">₹{format(emi)}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Principal Amount", value: formatL(loan) },
            { label: "Total Interest", value: formatL(totalInterest) },
            { label: "Total Payment", value: formatL(totalPayment) },
            { label: "Tenure", value: `${Math.floor(tenure / 12)}yr ${tenure % 12}mo` },
          ].map((r) => (
            <div key={r.label} className="bg-blue-700 rounded-xl p-3">
              <p className="text-blue-200 text-xs mb-1">{r.label}</p>
              <p className="text-white font-bold">₹{r.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-blue-500">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-100">Principal</span>
            <span className="text-blue-100">Interest</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-3">
            <div className="bg-white h-3 rounded-full" style={{ width: `${(loan / totalPayment) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-blue-200">{Math.round((loan / totalPayment) * 100)}%</span>
            <span className="text-blue-200">{Math.round((totalInterest / totalPayment) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Amortization Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Amortization Schedule</h3>
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

  // With prepayment
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
        <h2 className="font-bold text-gray-800 mb-4">Your Loan Details</h2>
        <SliderInput label="Original Loan Amount" value={loan} setValue={setLoan} min={100000} max={10000000} step={50000} />
        <SliderInput label="Interest Rate" value={rate} setValue={setRate} min={5} max={20} step={0.1} prefix="" suffix="%" />
        <SliderInput label="Original Tenure" value={tenure} setValue={setTenure} min={12} max={360} step={12} prefix="" suffix=" mo" />
        <SliderInput label="Prepayment in Month" value={prepayMonth} setValue={setPrepayMonth} min={1} max={tenure - 1} step={1} prefix="" suffix="" />
        <SliderInput label="Prepayment Amount" value={prepayAmount} setValue={setPrepayAmount} min={10000} max={loan} step={10000} />
        <div className="mt-2">
          <label className="text-sm font-semibold text-gray-700 block mb-2">After prepayment, I want to:</label>
          <div className="flex gap-3">
            {[
              { val: "reduce_tenure", label: "Reduce loan tenure" },
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
        <p className="text-green-100 text-sm mb-1">You Save</p>
        <p className="text-4xl font-bold mb-4">₹{format(Math.max(0, interestSaving))}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Months Saved", value: `${Math.max(0, monthsSaved)} months` },
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
          Prepaying ₹{formatL(prepayAmount)} in month {prepayMonth} saves you{" "}
          <span className="font-bold text-green-600">₹{format(Math.max(0, interestSaving))}</span> in interest — that's a{" "}
          <span className="font-bold">{prepayAmount > 0 ? Math.round((Math.max(0, interestSaving) / prepayAmount) * 100) : 0}% return</span> on your prepayment. Earlier you prepay, more you save.
        </p>
      </div>
    </>
  )
}

/* ── Tab 3: Loan Closure Guide ── */
function ClosureTab() {
  const [loan, setLoan] = useState(2500000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(240)
  const [extraEMIPerYear, setExtraEMIPerYear] = useState(1)
  const [annualEMIIncrease, setAnnualEMIIncrease] = useState(5)

  const emi = calcEMI(loan, rate, tenure)
  const totalInterestNormal = emi * tenure - loan

  // Scenario 1: Extra EMI per year
  const extraMonthlyEquivalent = (emi * extraEMIPerYear) / 12
  const newEMI1 = emi + extraMonthlyEquivalent
  const r = rate / 12 / 100
  const newTenure1 = r > 0 ? Math.ceil(Math.log(newEMI1 / (newEMI1 - loan * r)) / Math.log(1 + r)) : tenure
  const saving1 = totalInterestNormal - (newEMI1 * newTenure1 - loan)
  const monthsSaved1 = tenure - newTenure1

  // Scenario 2: Annual EMI step-up
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
    {
      icon: "📅",
      title: "Pay one extra EMI every year",
      desc: `On your ₹${formatL(loan)} loan, paying just ${extraEMIPerYear} extra EMI per year saves you ₹${formatL(Math.max(0, saving1))} and closes the loan ${Math.max(0, Math.floor(monthsSaved1 / 12))} years ${Math.max(0, monthsSaved1 % 12)} months early.`,
      highlight: true,
    },
    {
      icon: "📈",
      title: "Increase EMI by 5% every year",
      desc: `As your salary grows, step up your EMI annually. A ${annualEMIIncrease}% yearly increase saves ₹${formatL(saving2)} and closes your loan ${Math.max(0, Math.floor(monthsSaved2 / 12))} years early.`,
      highlight: true,
    },
    {
      icon: "🎯",
      title: "Use bonus for part prepayment",
      desc: "RBI rules: Banks CANNOT charge prepayment penalty on floating rate home loans. So every bonus or increment you put toward the loan reduces principal directly and saves massive interest.",
      highlight: false,
    },
    {
      icon: "⚡",
      title: "Early prepayment saves more",
      desc: "₹1 lakh prepaid in year 1 saves 3-4x more interest than ₹1 lakh prepaid in year 10. In early years, 80% of your EMI goes to interest. Prepay early to fight this.",
      highlight: false,
    },
    {
      icon: "🏦",
      title: "Switch to lower interest rate",
      desc: "If rates drop by 0.5% or more, consider balance transfer to another bank. Processing fee is usually ₹5,000-15,000 but savings can be lakhs on a large loan.",
      highlight: false,
    },
    {
      icon: "📋",
      title: "Choose tenure reduction over EMI reduction",
      desc: "When making a prepayment, always choose 'reduce tenure' not 'reduce EMI'. You save far more interest by closing faster than by keeping a lower EMI for the same period.",
      highlight: false,
    },
    {
      icon: "🔒",
      title: "Get NOC immediately after closure",
      desc: "Once loan is fully paid, collect No Objection Certificate (NOC) from bank, get original property documents back, and update CIBIL by getting a closure letter. Don't skip this step.",
      highlight: false,
    },
  ]

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Your Loan</h2>
        <SliderInput label="Loan Amount" value={loan} setValue={setLoan} min={100000} max={10000000} step={50000} />
        <SliderInput label="Interest Rate" value={rate} setValue={setRate} min={5} max={20} step={0.1} prefix="" suffix="%" />
        <SliderInput label="Tenure" value={tenure} setValue={setTenure} min={12} max={360} step={12} prefix="" suffix=" mo" />
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
          <div className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><span className="font-semibold">No prepayment penalty</span> on floating rate home loans — RBI banned this in 2012. Banks cannot charge you for prepaying.</span></div>
          <div className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><span className="font-semibold">Fixed rate loans</span> may have prepayment penalty — check your loan agreement before making large prepayments.</span></div>
          <div className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><span className="font-semibold">Part prepayment</span> must be applied to principal, not future EMIs. Demand a revised amortization schedule from your bank.</span></div>
          <div className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">✓</span><span><span className="font-semibold">After full closure</span> — bank must return all original property documents within 30 days as per RBI guidelines.</span></div>
        </div>
      </div>
    </>
  )
}

/* ── Tab 4: Compare Banks ── */
function CompareBanksTab() {
  const [loanAmount, setLoanAmount] = useState(2500000)
  const [tenure, setTenure] = useState(240)

  const banks = [
    { name: "SBI", rate: 8.5, logo: "🏛️", special: "Best for salaried govt employees" },
    { name: "HDFC Bank", rate: 8.75, logo: "🔵", special: "Fast processing, good for self-employed" },
    { name: "ICICI Bank", rate: 8.75, logo: "🟠", special: "Good balance transfer offers" },
    { name: "Axis Bank", rate: 8.75, logo: "🟣", special: "Flexible tenure options" },
    { name: "Kotak Mahindra", rate: 8.7, logo: "🔴", special: "Good for high credit score borrowers" },
    { name: "Bank of Baroda", rate: 8.4, logo: "🟡", special: "Lowest rate for eligible borrowers" },
    { name: "PNB Housing", rate: 8.5, logo: "🟢", special: "Good for tier 2 / tier 3 cities" },
    { name: "LIC Housing", rate: 8.5, logo: "⚪", special: "Popular for long tenure loans" },
  ]

  const withEMI = banks.map((b) => ({ ...b, emi: calcEMI(loanAmount, b.rate, tenure), totalInterest: calcEMI(loanAmount, b.rate, tenure) * tenure - loanAmount }))
  const best = withEMI.reduce((a, b) => (a.emi < b.emi ? a : b))

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Compare Home Loan Rates</h2>
        <p className="text-xs text-gray-400 mb-4">Rates as of June 2025 — always confirm with the bank before applying. Rates vary based on credit score and income.</p>
        <SliderInput label="Loan Amount" value={loanAmount} setValue={setLoanAmount} min={500000} max={10000000} step={100000} />
        <SliderInput label="Tenure" value={tenure} setValue={setTenure} min={60} max={360} step={12} prefix="" suffix=" mo" />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-700">
          <span className="font-bold">Lowest EMI: {best.name}</span> at {best.rate}% — ₹{format(best.emi)}/month.
          You save up to ₹{formatL(withEMI[withEMI.length - 1].totalInterest - best.totalInterest)} vs the highest rate option.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {withEMI.sort((a, b) => a.rate - b.rate).map((bank, i) => (
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
        <p className="text-sm font-semibold text-amber-700 mb-2">💡 Tips for Getting the Best Rate</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">CIBIL score 750+</span> gets you the best rates — check yours for free on CIBIL website before applying.</span></div>
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">Salary account bank</span> often gives 0.1–0.25% lower rate to existing customers.</span></div>
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">Women co-applicants</span> get 0.05–0.1% discount at most banks.</span></div>
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">Government employees</span> get lower rates at SBI and Bank of Baroda.</span></div>
          <div className="flex items-start gap-2"><span>✓</span><span><span className="font-semibold">Negotiate</span> — banks have flexibility, especially if you're bringing a large down payment.</span></div>
        </div>
      </div>
    </>
  )
}

/* ── FAQ & SEO Content ── */
function FaqSection() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: "What is the EMI for a 20 lakh home loan?", a: "For a ₹20 lakh home loan at 8.5% interest for 20 years, the EMI is approximately ₹17,356 per month. Use the EMI calculator above to adjust for your exact loan amount, rate, and tenure." },
    { q: "What happens if I miss an EMI?", a: "Missing an EMI adds a late payment fee (typically 2% of overdue amount), negatively impacts your CIBIL score, and the bank may mark the account as NPA after 90 days of non-payment. If you're facing difficulty, contact your bank immediately for a restructuring option." },
    { q: "Can I reduce my EMI after taking a loan?", a: "Yes. You can reduce EMI by making a part prepayment (the bank recalculates EMI on reduced principal), switching to a lower interest rate through balance transfer, or renegotiating rate with your existing bank if RBI repo rate has fallen." },
    { q: "Should I prepay my home loan or invest in SIP?", a: "If your home loan rate is 8.5% and equity mutual funds historically return 12%, investing in SIP gives a higher return mathematically. However, prepaying gives a guaranteed tax-free return equal to your interest rate. A good strategy: prepay aggressively in early years (interest-heavy) and shift to SIP once loan is below 40% of original amount." },
    { q: "Can the bank charge prepayment penalty?", a: "No. As per RBI guidelines, banks cannot charge prepayment penalty on floating rate home loans. Fixed rate loans may have a penalty — check your loan agreement. Always demand a letter confirming zero penalty before making a large prepayment." },
    { q: "What is the maximum home loan I can get?", a: "Banks typically give up to 80% of property value (LTV ratio). So for a ₹50 lakh property, maximum loan is ₹40 lakh. Your EMI should not exceed 40–50% of your net monthly income as per bank norms. Minimum CIBIL score required is usually 700–750." },
    { q: "What happens to home loan if I lose my job?", a: "Immediately inform your bank. Most banks offer EMI moratorium (pause) for 3–6 months for genuine hardship. You can also use your emergency fund to service EMIs. Loan insurance (if taken) may cover EMIs in case of job loss or disability." },
    { q: "Is home loan interest tax deductible?", a: "Yes. Under Section 24(b), interest up to ₹2 lakh per year is deductible from taxable income for a self-occupied property. Principal repayment up to ₹1.5 lakh qualifies under Section 80C. This benefit is only available in the Old Tax Regime." },
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

function SeoContent() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Home Loan EMI Guide for India</h2>
      <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is EMI?</h3>
          <p>EMI (Equated Monthly Installment) is the fixed monthly payment you make to repay your loan. Each EMI has two parts — interest on the outstanding loan, and principal repayment. In early months, most of the EMI goes toward interest. Over time, the principal portion increases.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">How is home loan EMI calculated?</h3>
          <p>EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the number of monthly installments. Our calculator uses this exact formula for accurate results.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is a good EMI to income ratio?</h3>
          <p>Banks allow EMI up to 40–50% of your net monthly income. However, financial advisors recommend keeping total EMI (all loans combined) below 35% of your in-hand salary. This leaves enough for living expenses, savings, and emergencies.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Floating vs Fixed interest rate — which is better?</h3>
          <p>Floating rates (linked to RBI repo rate) are lower than fixed rates and reduce further when RBI cuts rates. Fixed rates give certainty but are typically 1–2% higher. For long tenure loans (15–20 years), floating rate is generally better in India given RBI's rate cycles.</p>
        </div>
      </div>
    </div>
  )
}

/* ── FAQ Schema for SEO ── */
function FaqSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is the EMI for a 20 lakh home loan?", "acceptedAnswer": { "@type": "Answer", "text": "For a ₹20 lakh home loan at 8.5% for 20 years, the EMI is approximately ₹17,356 per month." } },
      { "@type": "Question", "name": "Can the bank charge prepayment penalty on home loan?", "acceptedAnswer": { "@type": "Answer", "text": "No. RBI guidelines prohibit prepayment penalty on floating rate home loans in India." } },
      { "@type": "Question", "name": "Should I prepay my home loan or invest in SIP?", "acceptedAnswer": { "@type": "Answer", "text": "If home loan rate is 8.5% and SIP returns 12%, SIP is better mathematically. But prepaying is a guaranteed risk-free return. Best strategy: prepay early years, then shift to SIP." } },
    ]
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

/* ── Main Export ── */
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
        <title>Home Loan EMI Calculator India 2025 — Prepayment, Bank Comparison | WebExt.in</title>
        <meta name="description" content="Free home loan EMI calculator India. Calculate monthly EMI, prepayment savings, compare bank rates (SBI, HDFC, ICICI), and learn how to close your loan faster. Instant results." />
      </Helmet>
      <FaqSchema />

      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</a>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Home Loan EMI Calculator</h1>
        <p className="text-gray-500 mb-6">Calculate EMI, plan prepayments, compare bank rates, and close your loan faster.</p>

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

        <FaqSection />
        <SeoContent />
      </div>
    </div>
  )
}