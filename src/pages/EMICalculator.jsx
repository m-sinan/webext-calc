import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

const format = (num) =>
  Number.isFinite(Number(num)) && !Number.isNaN(Number(num))
    ? Math.round(Number(num)).toLocaleString("en-IN")
    : "0"

const formatL = (num) => {
  const value = Number(num) || 0

  if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr"
  if (value >= 100000) return (value / 100000).toFixed(2) + " L"

  return format(value)
}

const formatTenure = (months) => {
  const totalMonths = Math.max(0, Math.round(Number(months) || 0))
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12

  if (y === 0) return `${m} months`
  if (m === 0) return `${y} years`

  return `${y}yr ${m}mo`
}

const clamp = (value, min, max) =>
  Math.min(Math.max(Number(value) || 0, min), max)

/* ─────────────────────────────────────────────
   SHARED UI
───────────────────────────────────────────── */

function SliderInput({
  label,
  value,
  setValue,
  min,
  max,
  step,
  prefix = "₹",
  suffix = "",
  hint = "",
}) {
  const numericValue = Number(value) || 0

  const handleNumberChange = (e) => {
    const raw = e.target.value

    if (raw === "") {
      setValue("")
      return
    }

    setValue(Number(raw))
  }

  const handleBlur = () => {
    const safeValue = clamp(
      Number(value) || Number(min),
      Number(min),
      Number(max)
    )

    setValue(safeValue)
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-700">
          {label}
        </label>

        {hint && (
          <span className="text-xs text-gray-400">
            {hint}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(e) => setValue(Number(e.target.value))}
          className="flex-1 accent-blue-600"
        />

        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden min-w-[130px]">
          {prefix && (
            <span className="px-2 text-gray-400 text-sm bg-gray-50 border-r border-gray-200">
              {prefix}
            </span>
          )}

          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumberChange}
            onBlur={handleBlur}
            className="w-full px-2 py-1.5 text-sm text-gray-700 focus:outline-none"
          />

          {suffix && (
            <span className="px-2 text-gray-400 text-sm bg-gray-50 border-l border-gray-200 whitespace-nowrap">
              {suffix}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>
          {prefix}
          {Number(min).toLocaleString("en-IN")}
          {suffix}
        </span>

        <span>
          {prefix}
          {Number(max).toLocaleString("en-IN")}
          {suffix}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   EMI CALCULATIONS
───────────────────────────────────────────── */

function calcEMI(principal, annualRate, months) {
  const P = Number(principal) || 0
  const rate = Number(annualRate) || 0
  const n = Number(months) || 0

  if (P <= 0 || n <= 0) return 0

  if (rate === 0) {
    return P / n
  }

  const r = rate / 12 / 100
  const factor = Math.pow(1 + r, n)

  return (P * r * factor) / (factor - 1)
}

function buildSchedule(principal, annualRate, months) {
  const P = Number(principal) || 0
  const rate = Number(annualRate) || 0
  const n = Number(months) || 0

  if (P <= 0 || n <= 0) return []

  const r = rate / 12 / 100
  const emi = calcEMI(P, rate, n)

  let balance = P
  const rows = []

  for (let i = 1; i <= n && balance > 0.01; i++) {
    const interest = rate === 0 ? 0 : balance * r

    const principalPart =
      rate === 0
        ? Math.min(emi, balance)
        : Math.min(Math.max(0, emi - interest), balance)

    balance = Math.max(0, balance - principalPart)

    rows.push({
      month: i,
      emi: principalPart + interest,
      interest,
      principal: principalPart,
      balance,
    })
  }

  return rows
}

/* ─────────────────────────────────────────────
   LOAN TYPE CONFIG
───────────────────────────────────────────── */

const LOAN_TYPES = {
  home: {
    label: "Home Loan",
    defaultAmount: 2500000,
    defaultRate: 8.5,
    defaultTenure: 240,
    maxAmount: 50000000,
    maxTenure: 360,
    minRate: 7,
  },

  car: {
    label: "Car Loan",
    defaultAmount: 800000,
    defaultRate: 9.5,
    defaultTenure: 60,
    maxAmount: 5000000,
    maxTenure: 84,
    minRate: 7,
  },

  personal: {
    label: "Personal Loan",
    defaultAmount: 500000,
    defaultRate: 14,
    defaultTenure: 36,
    maxAmount: 5000000,
    maxTenure: 60,
    minRate: 10,
  },
}

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition"
    >
      {copied ? "✅ Copied!" : "📋 Copy Result"}
    </button>
  )
}

/* ─────────────────────────────────────────────
   TAB 1 — EMI CALCULATOR
───────────────────────────────────────────── */

function EmiTab() {
  const [loanType, setLoanType] = useState("home")

  const [loan, setLoan] = useState(
    LOAN_TYPES.home.defaultAmount
  )

  const [rate, setRate] = useState(
    LOAN_TYPES.home.defaultRate
  )

  const [tenure, setTenure] = useState(
    LOAN_TYPES.home.defaultTenure
  )

  const [showFull, setShowFull] = useState(false)
  const [showReverse, setShowReverse] = useState(false)

  const [monthlyBudget, setMonthlyBudget] = useState(25000)
  const [reverseRate, setReverseRate] = useState(8.5)
  const [reverseTenure, setReverseTenure] = useState(240)

  const config = LOAN_TYPES[loanType]

  const safeLoan = Number(loan) || config.defaultAmount
  const safeRate = Number(rate) || config.defaultRate
  const safeTenure = Number(tenure) || config.defaultTenure

  const handleLoanTypeChange = (type) => {
    setLoanType(type)

    setLoan(LOAN_TYPES[type].defaultAmount)
    setRate(LOAN_TYPES[type].defaultRate)
    setTenure(LOAN_TYPES[type].defaultTenure)
  }

  const emi = calcEMI(
    safeLoan,
    safeRate,
    safeTenure
  )

  const totalPayment = emi * safeTenure
  const totalInterest = Math.max(0, totalPayment - safeLoan)

  const schedule = useMemo(
    () =>
      buildSchedule(
        safeLoan,
        safeRate,
        safeTenure
      ),
    [safeLoan, safeRate, safeTenure]
  )

  const displayRows = showFull
    ? schedule
    : schedule.slice(0, 12)

  /* Reverse EMI */
  const rR = Number(reverseRate) / 12 / 100
  const budget = Number(monthlyBudget) || 0
  const reverseMonths = Number(reverseTenure) || 0

  const maxLoan =
    rR > 0
      ? (budget *
          (Math.pow(1 + rR, reverseMonths) - 1)) /
        (rR * Math.pow(1 + rR, reverseMonths))
      : budget * reverseMonths

  const principalPercentage =
    totalPayment > 0
      ? Math.min(100, (safeLoan / totalPayment) * 100)
      : 0

  const copyText = `EMI Calculator Result (WebExt.in)
Loan Type: ${config.label}
Loan Amount: ₹${format(safeLoan)}
Interest Rate: ${safeRate}%
Tenure: ${formatTenure(safeTenure)}
Monthly EMI: ₹${format(emi)}
Total Interest: ₹${formatL(totalInterest)}
Total Payment: ₹${formatL(totalPayment)}`

  return (
    <>
      {/* Loan Type */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">
          Select Loan Type
        </h2>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {Object.entries(LOAN_TYPES).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                handleLoanTypeChange(key)
              }
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                loanType === key
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        <SliderInput
          label="Loan Amount"
          value={loan}
          setValue={setLoan}
          min={100000}
          max={config.maxAmount}
          step={50000}
        />

        <SliderInput
          label="Interest Rate (per year)"
          value={rate}
          setValue={setRate}
          min={config.minRate}
          max={25}
          step={0.1}
          prefix=""
          suffix="%"
        />

        <SliderInput
          label="Loan Tenure"
          value={tenure}
          setValue={setTenure}
          min={6}
          max={config.maxTenure}
          step={1}
          prefix=""
          suffix=" mo"
          hint={formatTenure(safeTenure)}
        />
      </div>

      {/* Main Result */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white mb-4">
        <p className="text-blue-100 text-sm mb-1">
          Monthly EMI
        </p>

        <p className="text-4xl font-bold mb-6">
          ₹{format(emi)}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            {
              label: "Principal Amount",
              value: formatL(safeLoan),
            },
            {
              label: "Total Interest",
              value: formatL(totalInterest),
            },
            {
              label: "Total Payment",
              value: formatL(totalPayment),
            },
            {
              label: "Tenure",
              value: formatTenure(safeTenure),
            },
          ].map((r) => (
            <div
              key={r.label}
              className="bg-blue-700 rounded-xl p-3"
            >
              <p className="text-blue-200 text-xs mb-1">
                {r.label}
              </p>

              <p className="text-white font-bold">
                {r.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2 pt-4 border-t border-blue-500">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-100">
              Principal{" "}
              {Math.round(principalPercentage)}%
            </span>

            <span className="text-blue-100">
              Interest{" "}
              {Math.round(
                Math.max(
                  0,
                  100 - principalPercentage
                )
              )}
              %
            </span>
          </div>

          <div className="w-full bg-blue-800 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full"
              style={{
                width: `${principalPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="flex justify-end mb-6">
        <CopyButton text={copyText} />
      </div>

      {/* Reverse EMI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <button
          type="button"
          onClick={() =>
            setShowReverse(!showReverse)
          }
          className="w-full flex justify-between items-center"
        >
          <div>
            <p className="font-bold text-gray-800 text-left">
              🔄 Reverse EMI Calculator
            </p>

            <p className="text-xs text-gray-400 text-left mt-0.5">
              What loan amount can I afford with my
              monthly budget?
            </p>
          </div>

          <span className="text-blue-600 text-lg">
            {showReverse ? "−" : "+"}
          </span>
        </button>

        {showReverse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <SliderInput
              label="Monthly EMI Budget"
              value={monthlyBudget}
              setValue={setMonthlyBudget}
              min={1000}
              max={500000}
              step={1000}
            />

            <SliderInput
              label="Expected Interest Rate"
              value={reverseRate}
              setValue={setReverseRate}
              min={5}
              max={25}
              step={0.1}
              prefix=""
              suffix="%"
            />

            <SliderInput
              label="Loan Tenure"
              value={reverseTenure}
              setValue={setReverseTenure}
              min={6}
              max={360}
              step={1}
              prefix=""
              suffix=" mo"
              hint={formatTenure(reverseMonths)}
            />

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-2">
              <p className="text-sm text-gray-600 mb-1">
                Maximum Loan You Can Afford
              </p>

              <p className="text-3xl font-bold text-green-600">
                ₹{formatL(maxLoan)}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                At ₹{format(budget)}/mo EMI for{" "}
                {formatTenure(reverseMonths)} at{" "}
                {reverseRate}% interest
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Amortization */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">
          Loan Amortization Schedule
        </h3>

        <p className="text-xs text-gray-400 mb-4">
          Month by month breakdown of principal,
          interest, and remaining balance.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-semibold">
                  Month
                </th>

                <th className="pb-2 font-semibold">
                  EMI
                </th>

                <th className="pb-2 font-semibold text-red-400">
                  Interest
                </th>

                <th className="pb-2 font-semibold text-green-600">
                  Principal
                </th>

                <th className="pb-2 font-semibold">
                  Balance
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-600">
              {displayRows.map((row) => (
                <tr
                  key={row.month}
                  className="border-b border-gray-50"
                >
                  <td className="py-2">
                    {row.month}
                  </td>

                  <td className="py-2">
                    ₹{format(row.emi)}
                  </td>

                  <td className="py-2 text-red-500">
                    ₹{format(row.interest)}
                  </td>

                  <td className="py-2 text-green-600">
                    ₹{format(row.principal)}
                  </td>

                  <td className="py-2">
                    ₹{format(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {schedule.length > 12 && (
          <button
            type="button"
            onClick={() =>
              setShowFull(!showFull)
            }
            className="mt-4 text-blue-600 text-sm font-semibold hover:underline"
          >
            {showFull
              ? "Show less ↑"
              : `Show all ${schedule.length} months ↓`}
          </button>
        )}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   TAB 2 — PREPAYMENT
───────────────────────────────────────────── */

function PrepaymentTab() {
  const [loan, setLoan] = useState(2500000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(240)
  const [prepayMonth, setPrepayMonth] = useState(12)
  const [prepayAmount, setPrepayAmount] = useState(100000)
  const [prepayType, setPrepayType] =
    useState("reduce_tenure")

  const safeLoan = Number(loan) || 2500000
  const safeRate = Number(rate) || 8.5
  const safeTenure = Number(tenure) || 240

  const safePrepayMonth = clamp(
    Number(prepayMonth) || 1,
    1,
    Math.max(1, safeTenure - 1)
  )

  const safePrepayAmount = clamp(
    Number(prepayAmount) || 0,
    0,
    safeLoan
  )

  const emi = calcEMI(
    safeLoan,
    safeRate,
    safeTenure
  )

  const scheduleWithout = buildSchedule(
    safeLoan,
    safeRate,
    safeTenure
  )

  const totalWithout = emi * safeTenure

  const interestWithout = Math.max(
    0,
    totalWithout - safeLoan
  )

  const balanceBeforePrepayment =
    scheduleWithout[
      safePrepayMonth - 1
    ]?.balance || safeLoan

  const newPrincipal = Math.max(
    0,
    balanceBeforePrepayment -
      safePrepayAmount
  )

  const remainingMonths = Math.max(
    0,
    safeTenure - safePrepayMonth
  )

  const monthlyRate =
    safeRate / 12 / 100

  let newEMI = emi
  let newTenure = remainingMonths

  if (newPrincipal <= 0) {
    newEMI = 0
    newTenure = 0
  } else if (prepayType === "reduce_tenure") {
    if (monthlyRate === 0) {
      newTenure = Math.ceil(
        newPrincipal / emi
      )
    } else {
      const denominator =
        emi -
        newPrincipal * monthlyRate

      if (denominator <= 0) {
        newTenure = remainingMonths
      } else {
        newTenure = Math.min(
          remainingMonths,
          Math.ceil(
            Math.log(
              emi / denominator
            ) /
              Math.log(
                1 + monthlyRate
              )
          )
        )
      }
    }

    newEMI = emi
  } else {
    newEMI = calcEMI(
      newPrincipal,
      safeRate,
      remainingMonths
    )

    newTenure = remainingMonths
  }

  const interestBeforePrepay =
    scheduleWithout
      .slice(0, safePrepayMonth)
      .reduce(
        (sum, row) =>
          sum + row.interest,
        0
      )

  const interestAfterPrepay =
    newEMI * newTenure -
    newPrincipal

  const totalInterestWith = Math.max(
    0,
    interestBeforePrepay +
      interestAfterPrepay
  )

  /*
    Important:
    Prepayment amount is principal, NOT interest.
    Therefore it must NOT be subtracted from
    interest savings.
  */
  const interestSaving = Math.max(
    0,
    interestWithout -
      totalInterestWith
  )

  const monthsSaved =
    prepayType === "reduce_tenure"
      ? Math.max(
          0,
          safeTenure -
            (safePrepayMonth +
              newTenure)
        )
      : 0

  const effectiveReturn =
    safePrepayAmount > 0
      ? (interestSaving /
          safePrepayAmount) *
        100
      : 0

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">
          Loan Prepayment Calculator
        </h2>

        <SliderInput
          label="Original Loan Amount"
          value={loan}
          setValue={setLoan}
          min={100000}
          max={50000000}
          step={50000}
        />

        <SliderInput
          label="Interest Rate"
          value={rate}
          setValue={setRate}
          min={5}
          max={25}
          step={0.1}
          prefix=""
          suffix="%"
        />

        <SliderInput
          label="Original Tenure"
          value={tenure}
          setValue={(value) => {
            const nextTenure = clamp(
              value,
              12,
              360
            )

            setTenure(nextTenure)

            setPrepayMonth((current) =>
              clamp(
                current,
                1,
                Math.max(
                  1,
                  nextTenure - 1
                )
              )
            )
          }}
          min={12}
          max={360}
          step={1}
          prefix=""
          suffix=" mo"
          hint={formatTenure(safeTenure)}
        />

        <SliderInput
          label="Prepayment in Month No."
          value={safePrepayMonth}
          setValue={setPrepayMonth}
          min={1}
          max={Math.max(
            1,
            safeTenure - 1
          )}
          step={1}
          prefix=""
          suffix=""
          hint={`Month ${safePrepayMonth} of ${safeTenure}`}
        />

        <SliderInput
          label="Prepayment Amount"
          value={prepayAmount}
          setValue={setPrepayAmount}
          min={10000}
          max={safeLoan}
          step={10000}
        />

        <div className="mt-2">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            After prepayment, I want to:
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            {[
              {
                val: "reduce_tenure",
                label: "✅ Reduce tenure",
              },
              {
                val: "reduce_emi",
                label: "Reduce monthly EMI",
              },
            ].map((option) => (
              <button
                key={option.val}
                type="button"
                onClick={() =>
                  setPrepayType(
                    option.val
                  )
                }
                className={
                  "flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition " +
                  (prepayType ===
                  option.val
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200")
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-green-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-green-100 text-sm mb-1">
          Total Interest Saved
        </p>

        <p className="text-4xl font-bold mb-4">
          ₹{format(interestSaving)}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Time Saved",
              value:
                monthsSaved > 0
                  ? formatTenure(
                      monthsSaved
                    )
                  : "0 months",
            },
            {
              label:
                prepayType ===
                "reduce_emi"
                  ? "New Monthly EMI"
                  : "EMI (unchanged)",
              value: `₹${format(newEMI)}`,
            },
            {
              label:
                "Interest Without Prepay",
              value: `₹${formatL(
                interestWithout
              )}`,
            },
            {
              label:
                "Interest With Prepay",
              value: `₹${formatL(
                totalInterestWith
              )}`,
            },
          ].map((r) => (
            <div
              key={r.label}
              className="bg-green-700 rounded-xl p-3"
            >
              <p className="text-green-200 text-xs mb-1">
                {r.label}
              </p>

              <p className="text-white font-bold">
                {r.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-amber-700 mb-2">
          💡 Key Insight
        </p>

        <p className="text-sm text-gray-600">
          Prepaying ₹{formatL(safePrepayAmount)}{" "}
          in month {safePrepayMonth} can save
          approximately{" "}
          <span className="font-bold text-green-600">
            ₹{format(interestSaving)}
          </span>{" "}
          in future interest under the selected
          repayment option. That is approximately a{" "}
          <span className="font-bold">
            {Math.round(
              effectiveReturn
            )}
            %
          </span>{" "}
          interest-saving benefit relative to the
          prepayment amount. Actual savings can vary
          based on your lender's repayment rules.
        </p>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   TAB 3 — CLOSE FASTER
───────────────────────────────────────────── */

function ClosureTab() {
  const [loan, setLoan] = useState(2500000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(240)
  const [extraEMIPerYear, setExtraEMIPerYear] =
    useState(1)
  const [annualEMIIncrease, setAnnualEMIIncrease] =
    useState(5)

  const safeLoan = Number(loan) || 2500000
  const safeRate = Number(rate) || 8.5
  const safeTenure = Number(tenure) || 240

  const emi = calcEMI(
    safeLoan,
    safeRate,
    safeTenure
  )

  const totalInterestNormal =
    emi * safeTenure - safeLoan

  /*
    Scenario 1:
    Paying extra EMIs per year is modelled as
    one additional EMI spread across the year.
  */
  const extraMonthlyEquivalent =
    (emi *
      Number(extraEMIPerYear)) /
    12

  const newEMI1 =
    emi + extraMonthlyEquivalent

  const r = safeRate / 12 / 100

  const newTenure1 =
    r > 0 &&
    newEMI1 >
      safeLoan * r
      ? Math.min(
          safeTenure,
          Math.ceil(
            Math.log(
              newEMI1 /
                (newEMI1 -
                  safeLoan * r)
            ) /
              Math.log(1 + r)
          )
        )
      : safeTenure

  const totalPaid1 =
    newEMI1 * newTenure1

  const saving1 = Math.max(
    0,
    totalInterestNormal -
      (totalPaid1 - safeLoan)
  )

  const monthsSaved1 = Math.max(
    0,
    safeTenure - newTenure1
  )

  /*
    Scenario 2:
    EMI increases every 12 months.
    We simulate month by month.
  */
  let balance2 = safeLoan
  let months2 = 0
  let totalPaid2 = 0
  let currentEMI2 = emi

  while (
    balance2 > 0.01 &&
    months2 < 600
  ) {
    if (
      months2 > 0 &&
      months2 % 12 === 0
    ) {
      currentEMI2 *=
        1 +
        Number(
          annualEMIIncrease
        ) /
          100
    }

    const interest =
      balance2 * r

    const actualPayment =
      Math.min(
        currentEMI2,
        balance2 + interest
      )

    const principal =
      Math.max(
        0,
        actualPayment -
          interest
      )

    balance2 = Math.max(
      0,
      balance2 - principal
    )

    totalPaid2 += actualPayment
    months2++
  }

  const saving2 = Math.max(
    0,
    totalInterestNormal -
      (totalPaid2 - safeLoan)
  )

  const monthsSaved2 = Math.max(
    0,
    safeTenure - months2
  )

  const tips = [
    {
      icon: "📅",
      title: "Pay extra EMIs every year",
      desc: `Paying ${extraEMIPerYear} extra EMI per year on your ₹${formatL(
        safeLoan
      )} loan can save about ₹${formatL(
        Math.max(0, saving1)
      )} in interest and close the loan around ${formatTenure(
        Math.max(
          0,
          monthsSaved1
        )
      )} earlier.`,
      highlight: true,
    },

    {
      icon: "📈",
      title: `Step up EMI by ${annualEMIIncrease}% every year`,
      desc: `Increasing your EMI by ${annualEMIIncrease}% every year as your income grows can save about ₹${formatL(
        saving2
      )} in interest and close the loan around ${formatTenure(
        Math.max(
          0,
          monthsSaved2
        )
      )} earlier.`,
      highlight: true,
    },

    {
      icon: "🎯",
      title: "Use bonuses for prepayment",
      desc: "Using part of a bonus or other surplus cash for principal prepayment can reduce future interest. Check your lender's current prepayment terms before making a large payment.",
      highlight: false,
    },

    {
      icon: "⚡",
      title: "Prepay early for maximum savings",
      desc: "A prepayment made earlier in the loan generally saves more future interest because the outstanding principal is higher during the early years.",
      highlight: false,
    },

    {
      icon: "🏦",
      title: "Check for a lower interest rate",
      desc: "If another lender offers a meaningfully lower rate, compare the potential interest saving against processing, legal, valuation, and other balance-transfer costs.",
      highlight: false,
    },

    {
      icon: "📋",
      title: "Compare tenure reduction vs EMI reduction",
      desc: "When making a part-prepayment, compare both options. Keeping the EMI unchanged and reducing tenure will generally result in greater interest savings.",
      highlight: false,
    },

    {
      icon: "🔒",
      title: "Keep closure documents safely",
      desc: "After full repayment, collect the lender's closure/NOC documentation and ensure the loan account is properly updated in your credit report.",
      highlight: false,
    },
  ]

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">
          Close Your Loan Faster
        </h2>

        <SliderInput
          label="Loan Amount"
          value={loan}
          setValue={setLoan}
          min={100000}
          max={50000000}
          step={50000}
        />

        <SliderInput
          label="Interest Rate"
          value={rate}
          setValue={setRate}
          min={5}
          max={25}
          step={0.1}
          prefix=""
          suffix="%"
        />

        <SliderInput
          label="Tenure"
          value={tenure}
          setValue={setTenure}
          min={12}
          max={360}
          step={1}
          prefix=""
          suffix=" mo"
          hint={formatTenure(safeTenure)}
        />

        <SliderInput
          label="Extra EMIs per year"
          value={extraEMIPerYear}
          setValue={setExtraEMIPerYear}
          min={1}
          max={6}
          step={1}
          prefix=""
          suffix=""
        />

        <SliderInput
          label="Annual EMI step-up %"
          value={annualEMIIncrease}
          setValue={setAnnualEMIIncrease}
          min={1}
          max={20}
          step={1}
          prefix=""
          suffix="%"
        />
      </div>

      <div className="space-y-4 mb-6">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className={`rounded-2xl p-5 border ${
              tip.highlight
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-100 shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {tip.icon}
              </span>

              <div>
                <h3
                  className={`font-bold mb-1 ${
                    tip.highlight
                      ? "text-blue-800"
                      : "text-gray-800"
                  }`}
                >
                  {tip.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-green-800 mb-2">
          ⚖️ Prepayment & Loan Closure
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">
              ✓
            </span>

            <span>
              Check your loan agreement and current
              lender policy before making a
              prepayment.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">
              ✓
            </span>

            <span>
              Floating-rate and fixed-rate loans can
              have different prepayment rules.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">
              ✓
            </span>

            <span>
              After a part-prepayment, ask the lender
              for the revised repayment schedule.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold">
              ✓
            </span>

            <span>
              After full closure, collect the required
              closure documents and verify the loan is
              updated with the credit bureau.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   TAB 4 — COMPARE BANKS
───────────────────────────────────────────── */

const BANK_DATA = {
  home: [
    {
      name: "Bank of Baroda",
      rate: 8.4,
      logo: "🟡",
      special:
        "Competitive rates for eligible borrowers",
    },
    {
      name: "SBI",
      rate: 8.5,
      logo: "🏛️",
      special:
        "Popular option for salaried borrowers",
    },
    {
      name: "PNB Housing",
      rate: 8.5,
      logo: "🟢",
      special:
        "Home loan options across India",
    },
    {
      name: "LIC Housing",
      rate: 8.5,
      logo: "⚪",
      special:
        "Popular for long-tenure housing loans",
    },
    {
      name: "Kotak Mahindra",
      rate: 8.7,
      logo: "🔴",
      special:
        "Rate can vary by borrower profile",
    },
    {
      name: "HDFC Bank",
      rate: 8.75,
      logo: "🔵",
      special:
        "Large branch and processing network",
    },
    {
      name: "ICICI Bank",
      rate: 8.75,
      logo: "🟠",
      special:
        "Home loan and balance transfer options",
    },
    {
      name: "Axis Bank",
      rate: 8.75,
      logo: "🟣",
      special:
        "Multiple home loan repayment options",
    },
  ],

  car: [
    {
      name: "SBI",
      rate: 8.85,
      logo: "🏛️",
      special:
        "Competitive rates for eligible customers",
    },
    {
      name: "Bank of Baroda",
      rate: 8.9,
      logo: "🟡",
      special:
        "Competitive new-car loan rates",
    },
    {
      name: "HDFC Bank",
      rate: 9.0,
      logo: "🔵",
      special:
        "Wide dealer and branch network",
    },
    {
      name: "ICICI Bank",
      rate: 9.1,
      logo: "🟠",
      special:
        "New and used vehicle financing",
    },
    {
      name: "Axis Bank",
      rate: 9.25,
      logo: "🟣",
      special:
        "Flexible vehicle loan options",
    },
    {
      name: "Kotak Mahindra",
      rate: 9.5,
      logo: "🔴",
      special:
        "Options for different borrower profiles",
    },
  ],

  personal: [
    {
      name: "SBI",
      rate: 11.45,
      logo: "🏛️",
      special:
        "Competitive rates for eligible customers",
    },
    {
      name: "Bank of Baroda",
      rate: 12.0,
      logo: "🟡",
      special:
        "Options for existing customers",
    },
    {
      name: "HDFC Bank",
      rate: 10.85,
      logo: "🔵",
      special:
        "Pre-approved offers for eligible customers",
    },
    {
      name: "ICICI Bank",
      rate: 10.85,
      logo: "🟠",
      special:
        "Personal loan options for salaried borrowers",
    },
    {
      name: "Axis Bank",
      rate: 11.25,
      logo: "🟣",
      special:
        "Flexible repayment options",
    },
    {
      name: "Kotak Mahindra",
      rate: 10.99,
      logo: "🔴",
      special:
        "Rates depend on credit profile",
    },
  ],
}

function CompareBanksTab() {
  const [loanType, setLoanType] =
    useState("home")

  const [loanAmount, setLoanAmount] =
    useState(2500000)

  const [tenure, setTenure] =
    useState(240)

  const config = LOAN_TYPES[loanType]
  const banks = BANK_DATA[loanType]

  const handleTypeChange = (type) => {
    setLoanType(type)

    setLoanAmount(
      LOAN_TYPES[type].defaultAmount
    )

    setTenure(
      LOAN_TYPES[type].defaultTenure
    )
  }

  const withEMI = banks
    .map((bank) => {
      const emi = calcEMI(
        loanAmount,
        bank.rate,
        tenure
      )

      return {
        ...bank,
        emi,
        totalInterest:
          emi * tenure -
          loanAmount,
      }
    })
    .sort(
      (a, b) =>
        a.rate - b.rate
    )

  const best = withEMI[0]
  const worst =
    withEMI[withEMI.length - 1]

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">
          Compare Bank Loan Rates
        </h2>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {Object.entries(LOAN_TYPES).map(
            ([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  handleTypeChange(key)
                }
                className={`py-2 rounded-xl text-sm font-semibold border-2 transition ${
                  loanType === key
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                }`}
              >
                {val.label}
              </button>
            )
          )}
        </div>

        <p className="text-xs text-gray-400 mb-4">
          ⚠️ Indicative rates only. Actual interest
          rates, fees, eligibility, and offers vary by
          lender and borrower profile. Confirm current
          rates directly with the lender before
          applying.
        </p>

        <SliderInput
          label="Loan Amount"
          value={loanAmount}
          setValue={setLoanAmount}
          min={100000}
          max={config.maxAmount}
          step={50000}
        />

        <SliderInput
          label="Tenure"
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

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-700">
          <span className="font-bold">
            Lowest listed rate: {best.name}
          </span>{" "}
          at {best.rate}% — approximately ₹
          {format(best.emi)}/mo.
          {" "}
          The difference in estimated total
          interest versus the highest listed rate is
          approximately ₹
          {formatL(
            Math.max(
              0,
              worst.totalInterest -
                best.totalInterest
            )
          )}
          .
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {withEMI.map((bank, i) => (
          <div
            key={bank.name}
            className={`bg-white rounded-2xl border p-4 shadow-sm ${
              i === 0
                ? "border-green-300 bg-green-50"
                : "border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {bank.logo}
                </span>

                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    {bank.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {bank.special}
                  </p>
                </div>
              </div>

              {i === 0 && (
                <span className="text-xs font-semibold bg-green-600 text-white px-2 py-0.5 rounded-full">
                  Lowest
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">
                  Rate
                </p>

                <p className="font-bold text-gray-800">
                  {bank.rate}%
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">
                  Monthly EMI
                </p>

                <p className="font-bold text-blue-600">
                  ₹{format(bank.emi)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">
                  Total Interest
                </p>

                <p className="font-bold text-red-500">
                  ₹{formatL(
                    bank.totalInterest
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-amber-700 mb-2">
          💡 Tips to Get a Better Loan Rate
        </p>

        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <span>✓</span>

            <span>
              Maintain a strong credit history and
              compare offers from multiple lenders.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span>✓</span>

            <span>
              Existing salary-account or banking
              relationships may qualify for special
              offers.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span>✓</span>

            <span>
              Compare the complete cost, including
              processing fees and other charges, not
              only the advertised interest rate.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span>✓</span>

            <span>
              Ask the lender whether the quoted rate
              is fixed, floating, or subject to
              borrower-specific conditions.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   FAQ DATA
───────────────────────────────────────────── */

const FAQS = [
  {
    q: "How is EMI calculated manually?",
    a: "EMI is calculated using the formula EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the total number of monthly instalments. For example, on a ₹25 lakh loan at 8.5% for 20 years, the monthly EMI is approximately ₹21,696.",
  },

  {
    q: "Does prepayment reduce EMI or loan tenure?",
    a: "It depends on the option offered by your lender. A part-prepayment can either reduce the monthly EMI while keeping the remaining tenure broadly similar, or keep the EMI unchanged and reduce the loan tenure. Keeping the EMI unchanged generally results in greater interest savings.",
  },

  {
    q: "What is the formula for calculating loan EMI?",
    a: "The standard EMI formula is EMI = P × r × (1+r)^n / ((1+r)^n − 1). P represents the principal loan amount, r is the monthly interest rate, and n is the number of monthly instalments.",
  },

  {
    q: "What is the EMI for a ₹20 lakh home loan?",
    a: "For a ₹20 lakh home loan at 8.5% annual interest for 20 years, the EMI is approximately ₹17,356 per month. The exact EMI changes if the interest rate or tenure is different.",
  },

  {
    q: "What happens if I miss an EMI?",
    a: "Missing an EMI can result in late or penal charges, additional interest, and a negative impact on your credit history. The exact consequences depend on the lender and your loan agreement. Contact your lender as soon as possible if you expect difficulty making a payment.",
  },

  {
    q: "Can I reduce my EMI after taking a loan?",
    a: "Yes. Depending on the lender and loan type, you may be able to reduce your EMI through a part-prepayment, interest-rate reduction, balance transfer, or restructuring option. Check the applicable terms and charges before making a decision.",
  },

  {
    q: "Should I prepay my home loan or invest in SIP?",
    a: "There is no single answer for everyone. Prepaying a loan gives a relatively predictable saving equal to the interest you avoid, while equity investments have higher potential returns but also carry market risk. Compare your loan rate, tax situation, investment horizon, emergency fund, and risk tolerance before deciding.",
  },

  {
    q: "Can the bank charge a prepayment penalty on a home loan?",
    a: "Prepayment charges depend on the loan type, interest-rate structure, lender, and applicable regulations. Floating-rate loans for individuals may have different rules from fixed-rate or other loan products. Always check your current loan agreement and lender policy.",
  },

  {
    q: "What is the maximum home loan I can get?",
    a: "The maximum home loan depends on property value, income, existing liabilities, credit profile, age, repayment capacity, lender policy, and applicable loan-to-value limits. Use an EMI calculator to estimate an affordable loan amount before applying.",
  },

  {
    q: "What happens to a home loan if I lose my job?",
    a: "If you lose your job, contact your lender quickly rather than waiting for payments to become overdue. Depending on the circumstances, the lender may discuss available repayment or restructuring options. Loan protection insurance, if purchased, may also provide benefits subject to its terms.",
  },

  {
    q: "Is home loan interest tax deductible?",
    a: "Home-loan tax benefits depend on the tax regime, property type, ownership, occupancy, loan purpose, and applicable tax rules for the relevant financial year. Tax rules can change, so verify the current rules with the Income Tax Department or a qualified tax professional.",
  },
]

/* ─────────────────────────────────────────────
   FAQ SECTION
───────────────────────────────────────────── */

function FaqSection() {
  const [open, setOpen] = useState(null)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-900 text-xl mb-4">
        Frequently Asked Questions — EMI Calculator
      </h2>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div
            key={faq.q}
            className="border border-gray-100 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() =>
                setOpen(
                  open === i ? null : i
                )
              }
              className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
              aria-expanded={open === i}
            >
              <span className="text-sm font-semibold text-gray-800 pr-4">
                {faq.q}
              </span>

              <span className="text-blue-600 text-lg flex-shrink-0">
                {open === i ? "−" : "+"}
              </span>
            </button>

            {open === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SEO CONTENT
───────────────────────────────────────────── */

function SeoContent() {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          EMI Calculation Formula
        </h2>

        <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
          <p>
            Every standard loan EMI calculator uses the
            same mathematical principle to calculate a
            fixed monthly instalment from the loan
            amount, interest rate, and repayment tenure.
          </p>

          <p className="font-mono text-gray-700 bg-gray-50 rounded-lg px-4 py-3 text-center text-sm">
            EMI = P × r × (1 + r)
            <sup>n</sup> / ((1 + r)
            <sup>n</sup> − 1)
          </p>

          <p>
            Here,{" "}
            <span className="font-semibold text-gray-700">
              P
            </span>{" "}
            is the principal loan amount,{" "}
            <span className="font-semibold text-gray-700">
              r
            </span>{" "}
            is the monthly interest rate (annual rate
            ÷ 12 ÷ 100), and{" "}
            <span className="font-semibold text-gray-700">
              n
            </span>{" "}
            is the loan tenure in months. As the loan is
            repaid, the interest component normally
            decreases while the principal component
            increases.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Home Loan EMI Calculator
        </h2>

        <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
          <p>
            Our home loan EMI calculator helps you
            estimate the monthly instalment, total
            interest, total repayment, and amortization
            schedule for a housing loan. You can adjust
            the loan amount, annual interest rate, and
            repayment tenure to compare different
            scenarios.
          </p>

          <p>
            Use the Prepayment tab to estimate potential
            interest savings, the Close Faster tab to
            model extra payments, and the Compare Banks
            tab to compare the indicative rates included
            in this calculator.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Car Loan EMI Calculator
        </h2>

        <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
          <p>
            Use the car loan EMI calculator to estimate
            monthly payments for a new or used vehicle
            loan. Your actual rate and loan amount can
            depend on the vehicle, lender, credit
            profile, income, down payment, and other
            eligibility criteria.
          </p>

          <p>
            Select "Car Loan" above and enter your
            expected loan amount, interest rate, and
            tenure to calculate the estimated EMI and
            total interest.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Personal Loan EMI Calculator
        </h2>

        <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
          <p>
            Personal loans are generally unsecured loans,
            so the interest rate can be higher than
            secured home or vehicle loans. The actual rate
            depends on factors such as credit history,
            income, employer profile, existing
            obligations, and lender policy.
          </p>

          <p>
            Select "Personal Loan" above to calculate an
            estimated monthly EMI and total interest for
            your loan amount and chosen repayment period.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          More on EMI &amp; Loan Planning
        </h2>

        <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              What is a Good EMI to Income Ratio?
            </h3>

            <p>
              Your affordable EMI depends on your income,
              household expenses, existing debts,
              emergency savings, and financial goals.
              Avoid choosing a loan amount simply because
              a lender approves it; make sure the monthly
              repayment fits comfortably within your
              overall budget.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Floating vs Fixed Interest Rate
            </h3>

            <p>
              A floating interest rate can change during
              the loan period, while a fixed rate provides
              greater payment certainty for the applicable
              fixed period. Compare the rate structure,
              reset terms, fees, and prepayment conditions
              before selecting a loan.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              How Can I Reduce Total Loan Interest?
            </h3>

            <p>
              You can potentially reduce total interest by
              choosing an affordable shorter tenure,
              making eligible part-prepayments, increasing
              your EMI as your income grows, or
              refinancing when the overall cost is
              genuinely lower.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   JSON-LD SCHEMA
───────────────────────────────────────────── */

function PageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id":
          "https://www.webext.in/emi-calculator#webapp",
        name: "WebExt EMI Calculator",
        url: "https://www.webext.in/emi-calculator",
        description:
          "Free EMI calculator for home loans, car loans, and personal loans in India. Calculate monthly EMI, total interest, total repayment, and amortization schedules.",
        applicationCategory:
          "FinanceApplication",
        operatingSystem: "All",
        browserRequirements:
          "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        publisher: {
          "@type": "Organization",
          name: "WebExt",
          url: "https://www.webext.in/",
        },
      },

      {
        "@type": "WebPage",
        "@id":
          "https://www.webext.in/emi-calculator#webpage",
        url: "https://www.webext.in/emi-calculator",
        name:
          "Free EMI Calculator India - Home, Car & Personal Loan EMI",
        description:
          "Calculate monthly loan EMI, total interest, total repayment and amortization schedules for home, car and personal loans in India.",
        isPartOf: {
          "@type": "WebSite",
          "@id":
            "https://www.webext.in/#website",
          name: "WebExt",
          url: "https://www.webext.in/",
        },
        mainEntity: {
          "@id":
            "https://www.webext.in/emi-calculator#webapp",
        },
      },

      {
        "@type": "BreadcrumbList",
        "@id":
          "https://www.webext.in/emi-calculator#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.webext.in/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "EMI Calculator",
            item: "https://www.webext.in/emi-calculator",
          },
        ],
      },

      {
        "@type": "FAQPage",
        "@id":
          "https://www.webext.in/emi-calculator#faq",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

/* ─────────────────────────────────────────────
   TABS
───────────────────────────────────────────── */

const TABS = [
  {
    id: "emi",
    label: "EMI Calculator",
  },
  {
    id: "prepayment",
    label: "Prepayment",
  },
  {
    id: "closure",
    label: "Close Faster",
  },
  {
    id: "banks",
    label: "Compare Banks",
  },
]

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function EMICalculator() {
  const [tab, setTab] = useState("emi")

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Helmet>
        <title>
          Free EMI Calculator India - Home, Car & Personal Loan | WebExt
        </title>

        <meta
          name="description"
          content="Free EMI calculator for home, car and personal loans in India. Calculate monthly EMI, total interest, total repayment and amortization schedule instantly."
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large"
        />

        <link
          rel="canonical"
          href="https://www.webext.in/emi-calculator"
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:title"
          content="Free EMI Calculator India - Home, Car & Personal Loan | WebExt"
        />

        <meta
          property="og:description"
          content="Calculate home loan, car loan and personal loan EMI, total interest and repayment schedule with WebExt's free EMI calculator."
        />

        <meta
          property="og:url"
          content="https://www.webext.in/emi-calculator"
        />

        <meta
          property="og:site_name"
          content="WebExt"
        />

        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content="Free EMI Calculator India | WebExt"
        />

        <meta
          name="twitter:description"
          content="Calculate EMI, total interest and loan repayment for home, car and personal loans in India."
        />
      </Helmet>

      <PageSchema />

      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb / Back */}
        <a
          href="/"
          className="text-blue-600 text-sm mb-6 inline-block hover:underline"
        >
          ← Back to all tools
        </a>

        {/* H1 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          EMI Calculator — Home Loan, Car &amp; Personal Loan
        </h1>

        <p className="text-gray-500 mb-6">
          Free online EMI calculator for India. Calculate
          monthly EMI, total interest, repayment amount,
          and amortization schedule. You can also model
          prepayments, compare indicative bank rates, and
          see ways to close your loan faster.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setTab(t.id)
              }
              className={
                "whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition " +
                (tab === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active Tool */}
        {tab === "emi" && <EmiTab />}

        {tab === "prepayment" && (
          <PrepaymentTab />
        )}

        {tab === "closure" && (
          <ClosureTab />
        )}

        {tab === "banks" && (
          <CompareBanksTab />
        )}

        {/* SEO Content */}
        <SeoContent />

        {/* FAQ */}
        <FaqSection />
      </div>
    </div>
  )
}