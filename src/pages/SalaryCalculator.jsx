import { useState } from "react"
import { Helmet } from "react-helmet-async"

const format = (num) => (isFinite(num) && !isNaN(num) ? Math.round(num).toLocaleString("en-IN") : "0")
const formatL = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr"
  if (num >= 100000) return (num / 100000).toFixed(2) + " L"
  return format(num)
}

/* ── Copy Button ── */
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

/* ── Shared UI components ── */
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

function NumberRow({ label, value, setValue, placeholder = "0", hint = "" }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-gray-700 block mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <span className="px-2 text-gray-400 text-sm bg-gray-50 border-r border-gray-200">₹</span>
        <input type="number" value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-700 focus:outline-none"
          placeholder={placeholder} />
      </div>
    </div>
  )
}

function CheckRow({ pass, title, detail }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${pass ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <span className="text-lg leading-none mt-0.5">{pass ? "✅" : "⚠️"}</span>
      <div>
        <p className={`text-sm font-semibold ${pass ? "text-green-700" : "text-red-700"}`}>{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

function HealthBar({ percentage, basicPercentOfGross }) {
  const healthy = percentage >= 50
  return (
    <div className={`rounded-2xl p-6 mb-6 border-2 ${healthy ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-lg ${healthy ? "text-green-700" : "text-red-700"}`}>In-Hand Percentage</h3>
        <span className={`text-3xl font-bold ${healthy ? "text-green-600" : "text-red-600"}`}>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div className={`h-3 rounded-full transition-all duration-500 ${healthy ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }} />
      </div>
      <p className={`text-sm ${healthy ? "text-green-600" : "text-red-600"}`}>
        {healthy
          ? `✅ Good — You're taking home ${percentage}% of gross. Above the 50% benchmark.`
          : `⚠️ Low — Only ${percentage}% in-hand. Standard benchmark is 50%+. Review your deductions.`}
      </p>
      {basicPercentOfGross !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between">
          <span className="text-xs text-gray-500">Basic Pay (% of Gross)</span>
          <span className={`text-sm font-bold ${basicPercentOfGross >= 40 ? "text-green-600" : "text-amber-600"}`}>
            {basicPercentOfGross}% {basicPercentOfGross >= 40 ? "✅" : "⚠️ below 40% norm"}
          </span>
        </div>
      )}
    </div>
  )
}

function BudgetCard({ monthlyInHand }) {
  const needs = monthlyInHand * 0.5
  const wants = monthlyInHand * 0.3
  const savings = monthlyInHand * 0.2
  const sip = monthlyInHand * 0.1
  const emergency = monthlyInHand * 3
  const annualInHand = monthlyInHand * 12

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="font-bold text-gray-800 mb-4">50/30/20 Budget Plan for Your Take Home Salary</h3>
      <div className="space-y-3 mb-5">
        {[
          { color: "bg-blue-500", label: "Needs — 50%", amount: needs, desc: "Rent, groceries, utilities, EMIs, insurance" },
          { color: "bg-amber-500", label: "Wants — 30%", amount: wants, desc: "Dining, entertainment, shopping, travel" },
          { color: "bg-green-500", label: "Savings & Investments — 20%", amount: savings, desc: "SIPs, PPF/NPS, emergency fund, debt prepayment" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <div className={`w-2 h-10 rounded-full ${r.color}`} />
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">{r.label}</span>
                <span className="font-bold text-gray-800">₹{format(r.amount)}</span>
              </div>
              <p className="text-xs text-gray-400">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-blue-700 mb-2">💡 SIP & Emergency Fund</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-400 mb-1">Minimum Monthly SIP</p>
            <p className="text-lg font-bold text-blue-600">₹{format(sip)}</p>
            <p className="text-xs text-gray-400">10% of in-hand</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-400 mb-1">Emergency Fund Target</p>
            <p className="text-lg font-bold text-blue-600">₹{format(emergency)}</p>
            <p className="text-xs text-gray-400">3 months of in-hand</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-700 mb-2">🧾 New vs Old Tax Regime — Quick Check</p>
        <div className="space-y-1 text-xs text-gray-500 mb-2">
          <div className="flex justify-between"><span>Old Regime</span><span className="font-semibold text-gray-700">Higher rates + HRA / 80C deductions</span></div>
          <div className="flex justify-between"><span>New Regime</span><span className="font-semibold text-gray-700">Lower rates, no deductions needed</span></div>
        </div>
        <p className={`text-xs font-semibold pt-2 border-t border-amber-100 ${annualInHand <= 700000 ? "text-green-600" : annualInHand <= 1000000 ? "text-amber-600" : "text-blue-600"}`}>
          {annualInHand <= 700000
            ? "✅ Your income likely qualifies for zero tax under Section 87A rebate in New Regime."
            : annualInHand <= 1000000
            ? "⚖️ Income in ₹7L–₹10L range — compare both regimes. Use the Income Tax tab for exact numbers."
            : "📊 Above ₹10L — Old regime often wins with HRA + home loan + 80C. Use the Income Tax tab for exact numbers."}
        </p>
      </div>
    </div>
  )
}

/* ── Salary Benchmark ── */
function SalaryBenchmark({ annualCtc }) {
  const lpa = annualCtc / 100000
  const benchmarks = [
    { exp: "Fresher (0-1 yr)", min: 3, max: 6, role: "Entry level — IT/non-IT" },
    { exp: "Junior (1-3 yrs)", min: 5, max: 12, role: "Software/Marketing/Finance" },
    { exp: "Mid-level (3-6 yrs)", min: 10, max: 25, role: "Senior Associate/Engineer" },
    { exp: "Senior (6-10 yrs)", min: 20, max: 50, role: "Lead/Manager level" },
    { exp: "Expert (10+ yrs)", min: 40, max: 150, role: "Director/Principal/VP" },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="font-bold text-gray-800 mb-1">📊 How Does Your Salary Compare?</h3>
      <p className="text-xs text-gray-400 mb-4">Industry average benchmarks in India (all sectors). Your CTC: ₹{formatL(annualCtc)}/yr</p>
      <div className="space-y-3">
        {benchmarks.map((b) => {
          const inRange = lpa >= b.min && lpa <= b.max
          const above = lpa > b.max
          return (
            <div key={b.exp} className={`p-3 rounded-xl border ${inRange ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}>
              <div className="flex justify-between items-center mb-1">
                <p className={`text-sm font-semibold ${inRange ? "text-blue-700" : "text-gray-700"}`}>{b.exp}</p>
                <p className="text-xs font-bold text-gray-600">₹{b.min}L – ₹{b.max}L/yr</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">{b.role}</p>
                {inRange && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Your range ✅</span>}
                {above && lpa > b.min && <span className="text-xs text-green-600 font-semibold">Above this ↑</span>}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">* Benchmarks are indicative averages. Actual salaries vary by city, company size, and skill set.</p>
    </div>
  )
}

/* ── Tab 1: CTC Estimator ── */
function CtcCalculator() {
  const [period, setPeriod] = useState("annual")
  const [ctcInput, setCtcInput] = useState(600000)
  const [bonusPercent, setBonusPercent] = useState(15)
  const [professionalTax, setProfessionalTax] = useState(200)
  const [additionalDeduction1, setAdditionalDeduction1] = useState("")
  const [additionalDeduction2, setAdditionalDeduction2] = useState("")
  const [includeEmployerPF, setIncludeEmployerPF] = useState(true)

  const annualCtc = period === "annual" ? Number(ctcInput) : Number(ctcInput) * 12
  const annualBonus = (annualCtc * Number(bonusPercent)) / 100
  const basic = (annualCtc - annualBonus) * 0.4
  const hra = basic * 0.5
  const employeePF = basic * 0.12
  const employerPF = includeEmployerPF ? basic * 0.12 : 0
  const monthlyEmployeePF = employeePF / 12
  const monthlyEmployerPF = employerPF / 12
  const monthlyAdditional = Number(additionalDeduction1 || 0) + Number(additionalDeduction2 || 0)
  const totalMonthlyDeductions = monthlyEmployeePF + Number(professionalTax) + monthlyAdditional
  const grossMonthly = annualCtc / 12
  const takeHomeBaseMonthly = grossMonthly - monthlyEmployerPF
  const inHandMonthly = takeHomeBaseMonthly - totalMonthlyDeductions
  const inHandAnnual = inHandMonthly * 12
  const inHandPercentage = grossMonthly > 0 ? Math.round((inHandMonthly / grossMonthly) * 100) : 0
  const basicPercentOfGross = grossMonthly > 0 ? Math.round(((basic / 12) / grossMonthly) * 100) : 0

  const handlePeriodChange = (newPeriod) => {
    if (newPeriod === period) return
    const current = period === "annual" ? Number(ctcInput) : Number(ctcInput) * 12
    setCtcInput(newPeriod === "annual" ? current : Math.round(current / 12))
    setPeriod(newPeriod)
  }

  const copyText = `Salary Calculator Result (WebExt.in)
Annual CTC: ₹${format(annualCtc)}
Monthly In-Hand: ₹${format(inHandMonthly)}
Annual In-Hand: ₹${format(inHandAnnual)}
Basic (Monthly): ₹${format(basic / 12)}
HRA (Monthly): ₹${format(hra / 12)}
Employee PF (Monthly): ₹${format(monthlyEmployeePF)}
Annual Bonus: ₹${format(annualBonus)}
In-Hand %: ${inHandPercentage}%`

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Calculate Take Home Salary from CTC</h2>
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {["annual", "monthly"].map((p) => (
              <button key={p} type="button" onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition capitalize ${period === p ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <SliderInput
          label={period === "annual" ? "Annual CTC" : "Monthly CTC"}
          value={ctcInput}
          setValue={setCtcInput}
          min={period === "annual" ? 100000 : 8000}
          max={period === "annual" ? 10000000 : 833000}
          step={period === "annual" ? 50000 : 5000}
          hint={period === "annual" ? `₹${formatL(ctcInput)} per year` : `₹${formatL(ctcInput * 12)} per year`}
        />
        <p className="text-xs text-gray-400 mb-4">
          Equivalent {period === "annual" ? "monthly" : "annual"}: ₹{period === "annual" ? format(annualCtc / 12) : format(annualCtc)}
        </p>
        <SliderInput label="Bonus % in CTC" value={bonusPercent} setValue={setBonusPercent} min={0} max={30} step={1} prefix="" suffix="%" />
        <SliderInput label="Monthly Professional Tax" value={professionalTax} setValue={setProfessionalTax} min={0} max={300} step={10} />
        <NumberRow label="Additional Deduction 1 (Optional)" value={additionalDeduction1} setValue={setAdditionalDeduction1} hint="e.g. Health insurance, food coupon deduction" />
        <NumberRow label="Additional Deduction 2 (Optional)" value={additionalDeduction2} setValue={setAdditionalDeduction2} />
        <label className="flex items-center gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
          <input type="checkbox" checked={includeEmployerPF} onChange={(e) => setIncludeEmployerPF(e.target.checked)} className="accent-blue-600" />
          Include Employer PF (12% of Basic — part of CTC not paid to you directly)
        </label>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Monthly In-Hand Salary</p>
            <p className="text-2xl font-bold">₹{format(inHandMonthly)}</p>
            <p className="text-blue-200 text-xs">₹{formatL(inHandAnnual)} /yr</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Gross Monthly Salary</p>
            <p className="text-2xl font-bold">₹{format(grossMonthly)}</p>
            <p className="text-blue-200 text-xs">₹{formatL(annualCtc)} /yr</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Basic (mo)", value: basic / 12 },
            { label: "HRA (mo)", value: hra / 12 },
            { label: "Employee PF (mo)", value: monthlyEmployeePF },
            { label: "Annual Bonus", value: annualBonus },
          ].map((r) => (
            <div key={r.label} className="bg-blue-700 rounded-xl p-3">
              <p className="text-blue-200 text-xs mb-1">{r.label}</p>
              <p className="text-white font-bold">₹{format(r.value)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <CopyButton text={copyText} />
      </div>

      <HealthBar percentage={inHandPercentage} basicPercentOfGross={basicPercentOfGross} />
      <SalaryBenchmark annualCtc={annualCtc} />
      <BudgetCard monthlyInHand={inHandMonthly} />
    </>
  )
}

/* ── Tab 2: Payslip Checker ── */
function PayslipChecker() {
  const [basic, setBasic] = useState(32083)
  const [hra, setHra] = useState(16042)
  const [conveyance, setConveyance] = useState(5347)
  const [otherAllowance, setOtherAllowance] = useState(5500)
  const [pf, setPf] = useState(3850)
  const [profTax, setProfTax] = useState(200)
  const [tds, setTds] = useState(0)
  const [otherDeduction, setOtherDeduction] = useState(748)
  const [state, setState] = useState("Karnataka")

  const totalEarnings = Number(basic) + Number(hra) + Number(conveyance) + Number(otherAllowance)
  const totalDeductions = Number(pf) + Number(profTax) + Number(tds) + Number(otherDeduction)
  const netPay = totalEarnings - totalDeductions
  const netPercentage = totalEarnings > 0 ? Math.round((netPay / totalEarnings) * 100) : 0
  const basicPercent = totalEarnings > 0 ? (Number(basic) / totalEarnings) * 100 : 0
  const expectedPF = Math.round(Number(basic) * 0.12)
  const pfCompliant = Math.abs(Number(pf) - expectedPF) <= Math.max(20, expectedPF * 0.05)

  const stateNotes = {
    Karnataka: "₹200/month once gross salary exceeds ₹25,000/month.",
    Maharashtra: "Slab-based up to ₹200/month. Often nil in February.",
    "Tamil Nadu": "Half-yearly, slab-based — not a flat monthly amount.",
    "West Bengal": "Monthly, slab-based, often lower than ₹200.",
    "Andhra Pradesh": "Monthly slab-based professional tax applies.",
    Telangana: "Monthly slab-based, similar to Andhra Pradesh.",
    Gujarat: "Professional tax applies based on salary slabs.",
    "Madhya Pradesh": "Professional tax applies based on salary slabs.",
    Kerala: "Slab-based, up to ₹200/month for salaries above ₹12,000.",
    Odisha: "Slab-based, up to ₹200/month.",
    Bihar: "Slab-based professional tax applies.",
    Jharkhand: "Slab-based professional tax applies.",
    Assam: "Slab-based professional tax applies.",
    "Himachal Pradesh": "Professional tax applies based on salary slabs.",
    Meghalaya: "Professional tax applies based on salary slabs.",
    Sikkim: "Professional tax applies in some cases.",
    Haryana: "No professional tax — Haryana does not levy professional tax.",
    "Uttar Pradesh": "No professional tax — UP does not levy professional tax.",
    Rajasthan: "No professional tax — Rajasthan does not levy professional tax.",
    Delhi: "No professional tax — Delhi does not levy professional tax.",
    Punjab: "No professional tax — Punjab does not levy professional tax.",
    Other: "Check with your HR — professional tax varies by state.",
  }

  const copyText = `Payslip Check Result (WebExt.in)
Gross Pay: ₹${format(totalEarnings)}
Total Deductions: ₹${format(totalDeductions)}
Net Pay (In-Hand): ₹${format(netPay)}
In-Hand %: ${netPercentage}%
PF Deducted: ₹${format(pf)} (Expected: ₹${format(expectedPF)})`

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-1">Payslip Checker — Verify Your Monthly Salary</h2>
        <p className="text-xs text-gray-400 mb-4">Enter actual monthly figures from your payslip — not CTC.</p>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Earnings</p>
        <NumberRow label="Basic Salary" value={basic} setValue={setBasic} />
        <NumberRow label="HRA" value={hra} setValue={setHra} />
        <NumberRow label="Conveyance Allowance" value={conveyance} setValue={setConveyance} />
        <NumberRow label="Other Allowances" value={otherAllowance} setValue={setOtherAllowance} hint="Special allowance, transport, daily allowance etc." />

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-4">Deductions</p>
        <NumberRow label="PF (Employee Contribution)" value={pf} setValue={setPf} />
        <NumberRow label="Professional Tax" value={profTax} setValue={setProfTax} />
        <NumberRow label="TDS / Income Tax Deducted" value={tds} setValue={setTds} hint="Monthly TDS deducted by employer on salary" />
        <NumberRow label="Other Deductions" value={otherDeduction} setValue={setOtherDeduction} hint="Food coupon, loan deduction etc." />

        <div className="mt-3">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Your State</label>
          <select value={state} onChange={(e) => setState(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none">
            {Object.keys(stateNotes).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-2">Professional tax in {state}: {stateNotes[state]}</p>
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><p className="text-blue-100 text-sm mb-1">Gross Pay</p><p className="text-2xl font-bold">₹{format(totalEarnings)}</p></div>
          <div><p className="text-blue-100 text-sm mb-1">Net Pay (In-Hand)</p><p className="text-2xl font-bold">₹{format(netPay)}</p></div>
        </div>
        <div className="flex justify-between text-sm pt-3 border-t border-blue-500">
          <span className="text-blue-100">Total Deductions</span>
          <span className="font-bold">₹{format(totalDeductions)}</span>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <CopyButton text={copyText} />
      </div>

      <HealthBar percentage={netPercentage} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Is Your Employer Following the Rules?</h3>
        <p className="text-xs text-gray-400 mb-4">Checked against Indian payroll norms. General guidance only — not legal advice.</p>
        <div className="space-y-3">
          <CheckRow
            pass={basicPercent >= 40}
            title={basicPercent >= 40 ? "Basic salary meets minimum norm" : "Basic salary is below the 40% minimum"}
            detail={`Your Basic is ${basicPercent.toFixed(1)}% of total earnings. Minimum recommended is 40%. Code on Wages 2019 pushes toward 50%.`}
          />
          <CheckRow
            pass={pfCompliant}
            title={pfCompliant ? "PF deduction matches 12% of Basic" : "PF deduction doesn't match 12% of Basic"}
            detail={`Expected PF ≈ ₹${format(expectedPF)}. You have ₹${format(pf)}. Mismatch may be due to PF wage ceiling of ₹15,000 Basic.`}
          />
          <CheckRow
            pass={Number(profTax) <= 250}
            title={Number(profTax) <= 250 ? "Professional tax is within normal range" : "Professional tax seems higher than usual"}
            detail={`Most states cap monthly professional tax at ₹200. ${stateNotes[state]}`}
          />
          <CheckRow
            pass={netPercentage >= 50}
            title={netPercentage >= 50 ? "Net pay is a healthy share of gross" : "Net pay is below the 50% benchmark"}
            detail={`You're taking home ${netPercentage}% of gross. Below 50% means high deductions — check with HR.`}
          />
        </div>
      </div>

      <BudgetCard monthlyInHand={netPay} />
    </>
  )
}

/* ── Tab 3: Increment Calculator ── */
function IncrementCalculator() {
  const [currentCtc, setCurrentCtc] = useState(600000)
  const [hikePercent, setHikePercent] = useState(15)
  const [targetCtc, setTargetCtc] = useState(0)
  const [showReverse, setShowReverse] = useState(false)

  const hikeAmount = (currentCtc * hikePercent) / 100
  const newCtc = currentCtc + hikeAmount
  const monthlyIncrease = hikeAmount / 12
  const currentMonthly = currentCtc / 12
  const newMonthly = newCtc / 12
  const currentInHand = currentMonthly * 0.7
  const newInHand = newMonthly * 0.7

  // Reverse: what hike % needed to reach target CTC
  const neededHike = targetCtc > currentCtc
    ? Math.round(((targetCtc - currentCtc) / currentCtc) * 100)
    : 0

  const copyText = `Increment Calculator Result (WebExt.in)
Current CTC: ₹${format(currentCtc)}/yr
Hike: ${hikePercent}%
New CTC: ₹${format(newCtc)}/yr
Monthly Increase: ₹${format(monthlyIncrease)}
New Monthly In-Hand (approx): ₹${format(newInHand)}`

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Salary Increment & Hike Calculator</h2>
        <SliderInput label="Current Annual CTC" value={currentCtc} setValue={setCurrentCtc}
          min={100000} max={10000000} step={50000}
          hint={`₹${formatL(currentCtc)}/yr`} />
        <SliderInput label="Hike Percentage" value={hikePercent} setValue={setHikePercent}
          min={1} max={150} step={1} prefix="" suffix="%" />
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-4">
        <p className="text-blue-100 text-sm mb-1">New Annual CTC After Hike</p>
        <p className="text-4xl font-bold mb-4">₹{formatL(newCtc)}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Hike Amount (Annual)", value: formatL(hikeAmount) },
            { label: "Monthly Increase", value: `₹${format(monthlyIncrease)}` },
            { label: "Current Monthly CTC", value: `₹${format(currentMonthly)}` },
            { label: "New Monthly CTC", value: `₹${format(newMonthly)}` },
          ].map((r) => (
            <div key={r.label} className="bg-blue-700 rounded-xl p-3">
              <p className="text-blue-200 text-xs mb-1">{r.label}</p>
              <p className="text-white font-bold">{r.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <CopyButton text={copyText} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-2">Estimated In-Hand Salary Change</h3>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
          ⚠️ Approximate estimate assuming ~70% of CTC as in-hand. Use CTC Estimator tab for exact calculation.
        </p>
        <div className="space-y-3">
          {[
            { label: "Current Monthly In-Hand (approx)", value: currentInHand, color: "text-gray-700" },
            { label: "New Monthly In-Hand (approx)", value: newInHand, color: "text-green-600" },
            { label: "Monthly In-Hand Increase (approx)", value: newInHand - currentInHand, color: "text-blue-600" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
              <span className="text-gray-500">{r.label}</span>
              <span className={`font-bold ${r.color}`}>₹{format(r.value)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">💡 Is this a good hike?</p>
          <p className={`text-sm font-semibold ${hikePercent < 8 ? "text-red-600" : hikePercent < 15 ? "text-amber-600" : "text-green-600"}`}>
            {hikePercent < 8
              ? `⚠️ ${hikePercent}% is below inflation (7-8%). Your real purchasing power is decreasing.`
              : hikePercent < 15
              ? `⚖️ ${hikePercent}% is a standard average hike in India. Decent but not exceptional.`
              : hikePercent < 30
              ? `✅ ${hikePercent}% is an above-average hike. Well done!`
              : `🚀 ${hikePercent}% is a job-switch level hike. Excellent!`}
          </p>
          <div className="mt-3 space-y-1 text-xs text-gray-500">
            <div className="flex justify-between"><span>Below average (below inflation)</span><span className="font-semibold text-red-500">Below 8%</span></div>
            <div className="flex justify-between"><span>Average hike in India</span><span className="font-semibold text-amber-500">8% – 15%</span></div>
            <div className="flex justify-between"><span>Above average / promotion hike</span><span className="font-semibold text-green-500">15% – 30%</span></div>
            <div className="flex justify-between"><span>Job switch hike (typical)</span><span className="font-semibold text-blue-500">30% – 50%+</span></div>
          </div>
        </div>
      </div>

      {/* Reverse Hike Calculator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <button type="button" onClick={() => setShowReverse(!showReverse)}
          className="w-full flex justify-between items-center">
          <div>
            <p className="font-bold text-gray-800 text-left">🎯 What hike % do I need?</p>
            <p className="text-xs text-gray-400 text-left mt-0.5">Enter your target CTC to find the required hike percentage</p>
          </div>
          <span className="text-blue-600 text-lg">{showReverse ? "−" : "+"}</span>
        </button>
        {showReverse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <NumberRow label="My Target Annual CTC" value={targetCtc} setValue={setTargetCtc} hint="Enter the CTC you want to achieve" />
            {targetCtc > currentCtc ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Hike % needed to reach ₹{formatL(Number(targetCtc))}</p>
                <p className="text-3xl font-bold text-green-600">{neededHike}%</p>
                <p className="text-xs text-gray-400 mt-1">
                  {neededHike <= 15 ? "Achievable in annual appraisal" : neededHike <= 40 ? "Likely needs a promotion or job switch" : "Typically requires a job switch"}
                </p>
              </div>
            ) : targetCtc > 0 ? (
              <p className="text-sm text-red-500">Target CTC must be higher than current CTC</p>
            ) : null}
          </div>
        )}
      </div>
    </>
  )
}

/* ── Tab 4: Gratuity Calculator ── */
function GratuityCalculator() {
  const [basicDa, setBasicDa] = useState(30000)
  const [years, setYears] = useState(5)
  const [months, setMonths] = useState(0)
  const [covered, setCovered] = useState(true)

  // Gratuity considers partial year if >= 6 months
  const totalYears = months >= 6 ? years + 1 : years
  const gratuity = covered
    ? (basicDa * 15 * totalYears) / 26
    : (basicDa * 15 * totalYears) / 30
  const isEligible = years >= 5

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Gratuity Calculator India — Check Your Eligibility</h2>
        <SliderInput label="Last Drawn Basic + DA (Monthly)" value={basicDa} setValue={setBasicDa}
          min={5000} max={500000} step={1000} hint={`₹${formatL(basicDa * 12)}/yr`} />
        <SliderInput label="Years of Service" value={years} setValue={setYears}
          min={1} max={40} step={1} prefix="" suffix=" yrs" />
        <SliderInput label="Additional Months (beyond years)" value={months} setValue={setMonths}
          min={0} max={11} step={1} prefix="" suffix=" mo"
          hint={months >= 6 ? "≥6 months counted as 1 full year" : "< 6 months not counted"} />

        <div className="mt-2">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Is your employer covered under the Gratuity Act?</label>
          <div className="flex gap-3">
            {[
              { label: "Yes (10+ employees)", val: true, desc: "Formula: × 15 ÷ 26" },
              { label: "No (< 10 employees)", val: false, desc: "Formula: × 15 ÷ 30" }
            ].map((o) => (
              <button key={String(o.val)} type="button" onClick={() => setCovered(o.val)}
                className={"flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition border-2 " + (covered === o.val ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200")}>
                <p>{o.label}</p>
                <p className={`text-xs mt-0.5 ${covered === o.val ? "text-blue-200" : "text-gray-400"}`}>{o.desc}</p>
              </button>
            ))}
          </div>
          {!covered && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700">⚠️ Employers with less than 10 employees are not legally required to pay gratuity under the Gratuity Act, but many do voluntarily. Check your appointment letter.</p>
            </div>
          )}
        </div>
      </div>

      <div className={`rounded-2xl p-6 text-white mb-6 ${isEligible ? "bg-blue-600" : "bg-gray-400"}`}>
        <p className="opacity-80 text-sm mb-1">Gratuity Amount</p>
        <p className="text-4xl font-bold mb-2">₹{isEligible ? formatL(gratuity) : "0"}</p>
        {!isEligible && <p className="text-sm opacity-80">⚠️ Minimum 5 years of continuous service required for gratuity eligibility.</p>}
        {isEligible && (
          <div>
            <p className="text-sm opacity-80">Eligible after {years} yrs {months} mo of service</p>
            {months >= 6 && <p className="text-xs opacity-70 mt-1">* {months} months rounded up to 1 full year as per Gratuity Act</p>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">How Gratuity is Calculated in India</h3>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Formula — Gratuity Act Covered (10+ employees)</p>
          <p className="text-sm text-gray-600 font-mono bg-white rounded-lg p-3 border border-gray-100">
            (Basic + DA) × 15 × Years ÷ 26
          </p>
          <p className="text-xs text-gray-400 mt-2">26 = working days/month. 15 = 15 days per year of service.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Formula — Not Covered (less than 10 employees)</p>
          <p className="text-sm text-gray-600 font-mono bg-white rounded-lg p-3 border border-gray-100">
            (Basic + DA) × 15 × Years ÷ 30
          </p>
        </div>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex justify-between border-b border-gray-50 pb-2"><span>Minimum service required</span><span className="font-semibold text-gray-700">5 years</span></div>
          <div className="flex justify-between border-b border-gray-50 pb-2"><span>Maximum gratuity (tax-free)</span><span className="font-semibold text-gray-700">₹20,00,000</span></div>
          <div className="flex justify-between border-b border-gray-50 pb-2"><span>Partial year rule</span><span className="font-semibold text-gray-700">≥6 months = 1 full year</span></div>
          <div className="flex justify-between border-b border-gray-50 pb-2"><span>Paid by</span><span className="font-semibold text-gray-700">Employer only</span></div>
          <div className="flex justify-between border-b border-gray-50 pb-2"><span>Taxability</span><span className="font-semibold text-gray-700">Tax-free up to ₹20L</span></div>
          <div className="flex justify-between"><span>Trigger events</span><span className="font-semibold text-gray-700">Resignation, retirement, death</span></div>
        </div>
      </div>
    </>
  )
}

/* ── Tab 5: Income Tax Calculator ── */
function IncomeTaxCalculator() {
  const [annualIncome, setAnnualIncome] = useState(800000)
  const [hraExemption, setHraExemption] = useState(60000)
  const [section80C, setSection80C] = useState(150000)
  const [homeLoanInterest, setHomeLoanInterest] = useState(0)
  const [npsContribution, setNpsContribution] = useState(0)
  const [medicalInsurance, setMedicalInsurance] = useState(0)

  const standardDeduction = 75000 // Updated to FY 2025-26

  // Old regime
  const oldDeductions = Math.min(section80C, 150000) + 50000 + hraExemption +
    Math.min(homeLoanInterest, 200000) + Math.min(npsContribution, 50000) +
    Math.min(medicalInsurance, 25000)
  const oldTaxableIncome = Math.max(0, annualIncome - oldDeductions)

  const calcOldTax = (income) => {
    if (income <= 250000) return 0
    if (income <= 500000) return (income - 250000) * 0.05
    if (income <= 1000000) return 12500 + (income - 500000) * 0.2
    return 112500 + (income - 1000000) * 0.3
  }

  const oldTaxBeforeRebate = calcOldTax(oldTaxableIncome)
  const oldRebate = oldTaxableIncome <= 500000 ? oldTaxBeforeRebate : 0
  const oldTax = oldTaxBeforeRebate - oldRebate
  const oldCess = oldTax * 0.04
  const oldTotalTax = oldTax + oldCess

  // New regime FY 2025-26 (updated slabs)
  const newTaxableIncome = Math.max(0, annualIncome - standardDeduction)

  const calcNewTax = (income) => {
    if (income <= 400000) return 0
    if (income <= 800000) return (income - 400000) * 0.05
    if (income <= 1200000) return 20000 + (income - 800000) * 0.1
    if (income <= 1600000) return 60000 + (income - 1200000) * 0.15
    if (income <= 2000000) return 120000 + (income - 1600000) * 0.2
    if (income <= 2400000) return 200000 + (income - 2000000) * 0.25
    return 300000 + (income - 2400000) * 0.3
  }

  const newTaxBeforeRebate = calcNewTax(newTaxableIncome)
  const newRebate = newTaxableIncome <= 1200000 ? newTaxBeforeRebate : 0 // Updated rebate limit
  const newTax = newTaxBeforeRebate - newRebate
  const newCess = newTax * 0.04
  const newTotalTax = newTax + newCess

  const oldWins = oldTotalTax < newTotalTax
  const saving = Math.abs(newTotalTax - oldTotalTax)

  const copyText = `Income Tax Result (WebExt.in)
Annual Income: ₹${format(annualIncome)}
Old Regime Tax: ₹${format(oldTotalTax)}
New Regime Tax: ₹${format(newTotalTax)}
Better Regime: ${oldWins ? "Old Regime" : "New Regime"}
You Save: ₹${format(saving)}`

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Income Tax Calculator — New vs Old Regime FY 2025-26</h2>
        <SliderInput label="Annual Gross Income" value={annualIncome} setValue={setAnnualIncome}
          min={300000} max={10000000} step={50000} hint={`₹${formatL(annualIncome)}/yr`} />
        <p className="text-xs text-gray-400 -mt-3 mb-5">
          Standard deduction: ₹75,000 (New Regime) / ₹50,000 (Old Regime) — applied automatically.
        </p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Old Regime Deductions Only</p>
        <SliderInput label="HRA Exemption (annual)" value={hraExemption} setValue={setHraExemption} min={0} max={500000} step={5000} />
        <SliderInput label="Section 80C (PF + ELSS + PPF etc.)" value={section80C} setValue={setSection80C} min={0} max={150000} step={5000} />
        <SliderInput label="Home Loan Interest — Section 24 (max ₹2L)" value={homeLoanInterest} setValue={setHomeLoanInterest} min={0} max={200000} step={5000} />
        <SliderInput label="NPS — Section 80CCD(1B) (max ₹50K)" value={npsContribution} setValue={setNpsContribution} min={0} max={50000} step={1000} />
        <SliderInput label="Medical Insurance — 80D (max ₹25K)" value={medicalInsurance} setValue={setMedicalInsurance} min={0} max={50000} step={1000} />
      </div>

      <div className={`rounded-2xl p-6 text-white mb-4 ${oldWins ? "bg-green-600" : "bg-blue-600"}`}>
        <p className="opacity-80 text-sm mb-1">
          {oldWins ? "✅ Old Regime saves you more" : "✅ New Regime saves you more"}
        </p>
        <p className="text-4xl font-bold mb-1">₹{format(saving)}</p>
        <p className="opacity-80 text-sm">Annual saving by choosing {oldWins ? "Old" : "New"} Regime</p>
      </div>

      <div className="flex justify-end mb-6">
        <CopyButton text={copyText} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">New Regime vs Old Regime — Side by Side</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: "Old Regime", taxable: oldTaxableIncome, tax: oldTaxBeforeRebate, rebate: oldRebate, final: oldTotalTax, wins: oldWins },
            { label: "New Regime", taxable: newTaxableIncome, tax: newTaxBeforeRebate, rebate: newRebate, final: newTotalTax, wins: !oldWins },
          ].map((r) => (
            <div key={r.label} className={`rounded-xl p-4 border-2 ${r.wins ? "border-green-300 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
              <p className={`text-sm font-bold mb-3 ${r.wins ? "text-green-700" : "text-gray-700"}`}>{r.label} {r.wins ? "✅" : ""}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between"><span>Taxable Income</span><span className="font-semibold text-gray-700">₹{format(r.taxable)}</span></div>
                <div className="flex justify-between"><span>Tax Before Rebate</span><span className="font-semibold text-gray-700">₹{format(r.tax)}</span></div>
                {r.rebate > 0 && <div className="flex justify-between"><span>87A Rebate</span><span className="font-semibold text-green-600">-₹{format(r.rebate)}</span></div>}
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Total Tax + Cess</span>
                  <span className={`font-bold ${r.wins ? "text-green-600" : "text-red-500"}`}>₹{format(r.final)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Simplified estimate. Actual tax depends on other income, city, employer payroll. Consult a CA for exact filing.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">New Regime Tax Slabs — FY 2025-26 (Budget 2025)</h3>
        <div className="space-y-2">
          {[
            { range: "Up to ₹4,00,000", rate: "0%", color: "text-green-600" },
            { range: "₹4,00,001 – ₹8,00,000", rate: "5%", color: "text-blue-600" },
            { range: "₹8,00,001 – ₹12,00,000", rate: "10%", color: "text-blue-600" },
            { range: "₹12,00,001 – ₹16,00,000", rate: "15%", color: "text-amber-600" },
            { range: "₹16,00,001 – ₹20,00,000", rate: "20%", color: "text-amber-600" },
            { range: "₹20,00,001 – ₹24,00,000", rate: "25%", color: "text-orange-600" },
            { range: "Above ₹24,00,000", rate: "30%", color: "text-red-600" },
          ].map((s) => (
            <div key={s.range} className="flex justify-between text-sm border-b border-gray-50 pb-2">
              <span className="text-gray-500">{s.range}</span>
              <span className={`font-bold ${s.color}`}>{s.rate}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-xs text-green-700 font-semibold">
            🎉 Budget 2025 Update: Zero tax up to ₹12 lakh income under New Regime (87A rebate). Standard deduction increased to ₹75,000.
          </p>
        </div>
      </div>
    </>
  )
}

/* ── FAQ Section ── */
function FaqSection() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: "How is in-hand salary calculated from CTC?", a: "In-hand salary = CTC minus employer PF (12% of basic) minus employee PF (12% of basic) minus professional tax minus any other deductions. Typically, in-hand salary is 70-75% of CTC. Use our free salary calculator India to get an accurate estimate." },
    { q: "What is the difference between CTC and in-hand salary?", a: "CTC (Cost to Company) is the total amount a company spends on an employee annually, including PF, gratuity, insurance etc. In-hand salary is what you actually receive in your bank account each month after all deductions." },
    { q: "How much take home salary for 6 LPA in India?", a: "For a 6 LPA CTC, your monthly take home salary is approximately ₹42,000 to ₹45,000 depending on your professional tax, PF structure, and bonus component. Use our take home salary calculator for exact figures." },
    { q: "What is professional tax and who pays it?", a: "Professional tax is a state-level tax deducted from your salary every month. It varies by state — Karnataka charges ₹200/month for salaries above ₹25,000. States like Haryana, Delhi, UP do not have professional tax." },
    { q: "Which is better — New Regime or Old Regime FY 2025-26?", a: "For FY 2025-26, New Regime is better for most salaried employees — zero tax up to ₹12 lakh income and standard deduction increased to ₹75,000. Old Regime wins only if you have very high deductions (home loan + HRA + 80C exceeding ₹4L+)." },
    { q: "What is gratuity and when am I eligible?", a: "Gratuity is a lump-sum payment from your employer when you leave after 5+ years of continuous service. Formula: (Basic + DA) × 15 × Years ÷ 26. Maximum tax-free gratuity is ₹20 lakhs. If your tenure has 6+ extra months beyond full years, it counts as an additional year." },
    { q: "What is a good salary hike percentage in India?", a: "Average salary hike in India is 8-12% annually. Above 15% is considered a good hike. Job switches typically fetch 30-50% hike." },
    { q: "How much of my salary should I save each month?", a: "Follow the 50/30/20 rule — 50% for needs, 30% for wants, and 20% for savings and investments. Minimum monthly SIP should be 10% of in-hand salary." },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-900 text-xl mb-4">Frequently Asked Questions — Salary Calculator India</h2>
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Salary Calculator India — Complete Guide to CTC, In-Hand & Tax</h2>
      <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is In-Hand Salary and How to Calculate It?</h3>
          <p>In-hand salary (take home salary) is the amount credited to your bank account after PF, professional tax, and TDS deductions. Use our free salary calculator India to instantly calculate monthly in-hand salary from CTC. Typically 70-75% of your total package.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">How is Monthly Salary Calculated from Annual CTC?</h3>
          <p>Monthly salary = Annual CTC ÷ 12. But your monthly in-hand is lower due to Employee PF (12% of basic), Professional Tax (up to ₹200/month), and TDS. Our take home salary calculator shows the exact breakdown.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">New Regime vs Old Regime FY 2025-26 — Which is Better?</h3>
          <p>Budget 2025 made the New Regime very attractive — zero tax up to ₹12 lakh and standard deduction of ₹75,000. Old Regime wins only if your total deductions (HRA + 80C + home loan + NPS + medical) exceed ₹4+ lakhs. Use our income tax calculator to compare both instantly.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is Gratuity and When Do You Get It?</h3>
          <p>Gratuity is a lump-sum from your employer after 5+ years of service. Formula: (Basic + DA) × 15 × Years ÷ 26. Tax-free up to ₹20 lakhs. If you have 6+ months beyond full years, they count as an extra year.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">What is a Good Salary Hike in India?</h3>
          <p>Average hike is 8–12% annually. Above 15% is above average. Job switches typically fetch 30–50% hike — the fastest way to grow salary in India.</p>
        </div>
      </div>
    </div>
  )
}

/* ── FAQ Schema ── */
function FaqSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How is in-hand salary calculated from CTC?", "acceptedAnswer": { "@type": "Answer", "text": "In-hand salary = CTC minus employer PF minus employee PF minus professional tax minus other deductions. Typically 70-75% of CTC." } },
      { "@type": "Question", "name": "How much take home salary for 6 LPA in India?", "acceptedAnswer": { "@type": "Answer", "text": "For 6 LPA CTC, monthly take home is approximately ₹42,000 to ₹45,000 depending on deductions." } },
      { "@type": "Question", "name": "Which is better — New Regime or Old Regime FY 2025-26?", "acceptedAnswer": { "@type": "Answer", "text": "New Regime is better for most salaried employees in FY 2025-26 — zero tax up to ₹12 lakh. Old Regime wins only with very high deductions." } },
      { "@type": "Question", "name": "What is gratuity and when am I eligible?", "acceptedAnswer": { "@type": "Answer", "text": "Gratuity is paid after 5+ years of service. Formula: (Basic + DA) × 15 × Years ÷ 26. Tax-free up to ₹20 lakhs." } },
      { "@type": "Question", "name": "What is a good salary hike percentage in India?", "acceptedAnswer": { "@type": "Answer", "text": "Average hike is 8-12%. Above 15% is good. Job switches give 30-50% hike." } },
      { "@type": "Question", "name": "What is professional tax in India?", "acceptedAnswer": { "@type": "Answer", "text": "Professional tax is a state tax deducted monthly. Karnataka charges ₹200/month. States like Delhi, Haryana, UP have no professional tax." } },
    ]
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

/* ── Main Export ── */
const TABS = [
  { id: "ctc", label: "CTC Estimator" },
  { id: "payslip", label: "Check Payslip" },
  { id: "increment", label: "Increment" },
  { id: "gratuity", label: "Gratuity" },
  { id: "tax", label: "Income Tax" },
]

export default function SalaryCalculator() {
  const [tab, setTab] = useState("ctc")

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>Salary Calculator India — Take Home Salary, CTC, Tax & Gratuity | WebExt.in</title>
        <meta name="description" content="Free salary calculator India. Calculate take home salary from CTC, check payslip, compare new vs old tax regime FY 2025-26, gratuity and salary hike. Instant & accurate." />
        <link rel="canonical" href="https://www.webext.in/salary-calculator" />
      </Helmet>
      <FaqSchema />

      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">← Back to all tools</a>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Salary Calculator India — Take Home, Tax & Gratuity</h1>
        <p className="text-gray-500 mb-6">Free online salary calculator India. Calculate in-hand salary from CTC, check payslip, compare income tax regimes, gratuity and increment — all in one place.</p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={"whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition " + (tab === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600")}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "ctc" && <CtcCalculator />}
        {tab === "payslip" && <PayslipChecker />}
        {tab === "increment" && <IncrementCalculator />}
        {tab === "gratuity" && <GratuityCalculator />}
        {tab === "tax" && <IncomeTaxCalculator />}

        <FaqSection />
        <SeoContent />
      </div>
    </div>
  )
}