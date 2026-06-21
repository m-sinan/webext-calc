import { useState } from "react"
import { Link } from "react-router-dom"

export const format = (num) => {
  const n = Number(num)
  if (!isFinite(n) || isNaN(n)) return "0"
  if (Number.isInteger(n)) return n.toLocaleString("en-IN")
  return parseFloat(n.toFixed(4)).toLocaleString("en-IN")
}

export function ResultBox({ label, value, color = "blue" }) {
  const colors = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    amber: "bg-amber-500",
    red: "bg-red-500",
  }
  return (
    <div className={`${colors[color]} rounded-2xl p-5 text-white mb-6`}>
      <p className="opacity-80 text-sm mb-1">{label}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  )
}

export function InputBox({ label, value, setValue, prefix = "", suffix = "", placeholder = "0" }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-gray-700 block mb-1">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400">
        {prefix && <span className="px-3 text-gray-400 text-sm bg-gray-50 border-r border-gray-200 py-2.5">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
        />
        {suffix && <span className="px-3 text-gray-400 text-sm bg-gray-50 border-l border-gray-200 py-2.5">{suffix}</span>}
      </div>
    </div>
  )
}

/* ── Calculator 1: X% of Y ── */
export function PercentOfNumber() {
  const [percent, setPercent] = useState(15)
  const [number, setNumber] = useState(5000)
  const result = (Number(percent) / 100) * Number(number)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-800 mb-1">What is X% of Y?</h2>
      <p className="text-xs text-gray-400 mb-4">Example: What is 15% of 5000?</p>
      <InputBox label="Percentage" value={percent} setValue={setPercent} suffix="%" />
      <InputBox label="Number" value={number} setValue={setNumber} prefix="₹" />
      <div className="bg-blue-600 rounded-xl p-4 text-white mt-2">
        <p className="text-blue-100 text-sm">{percent}% of {format(number)} is</p>
        <p className="text-3xl font-bold">₹{format(result)}</p>
      </div>
    </div>
  )
}

/* ── Calculator 2: X is what % of Y ── */
export function WhatPercent() {
  const [part, setPart] = useState(750)
  const [total, setTotal] = useState(5000)
  const result = (Number(part) / Number(total)) * 100
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-800 mb-1">X is what % of Y?</h2>
      <p className="text-xs text-gray-400 mb-4">Example: 750 is what % of 5000?</p>
      <InputBox label="Value (X)" value={part} setValue={setPart} prefix="₹" />
      <InputBox label="Total (Y)" value={total} setValue={setTotal} prefix="₹" />
      <div className="bg-green-600 rounded-xl p-4 text-white mt-2">
        <p className="text-green-100 text-sm">{format(part)} is what % of {format(total)}?</p>
        <p className="text-3xl font-bold">{format(result)}%</p>
      </div>
    </div>
  )
}

/* ── Calculator 3: Percentage Increase / Decrease ── */
export function PercentChange() {
  const [oldVal, setOldVal] = useState(400)
  const [newVal, setNewVal] = useState(500)
  const change = Number(newVal) - Number(oldVal)
  const result = (change / Number(oldVal)) * 100
  const isIncrease = result >= 0
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-800 mb-1">Percentage Increase / Decrease</h2>
      <p className="text-xs text-gray-400 mb-4">Example: Change from 400 to 500</p>
      <InputBox label="Original Value" value={oldVal} setValue={setOldVal} />
      <InputBox label="New Value" value={newVal} setValue={setNewVal} />
      <div className={`${isIncrease ? "bg-green-600" : "bg-red-500"} rounded-xl p-4 text-white mt-2`}>
        <p className="opacity-80 text-sm">{format(oldVal)} → {format(newVal)}</p>
        <p className="text-3xl font-bold">{isIncrease ? "+" : ""}{format(result)}%</p>
        <p className="opacity-80 text-sm mt-1">{isIncrease ? "Increase" : "Decrease"} of {format(Math.abs(change))}</p>
      </div>
    </div>
  )
}

/* ── Calculator 4: Add percentage to number ── */
export function AddPercent() {
  const [number, setNumber] = useState(1000)
  const [percent, setPercent] = useState(18)
  const added = (Number(percent) / 100) * Number(number)
  const result = Number(number) + added
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-800 mb-1">Add % to a Number</h2>
      <p className="text-xs text-gray-400 mb-4">Example: 1000 + 18% GST = ?</p>
      <InputBox label="Original Amount" value={number} setValue={setNumber} prefix="₹" />
      <InputBox label="Percentage to Add" value={percent} setValue={setPercent} suffix="%" />
      <div className="bg-purple-600 rounded-xl p-4 text-white mt-2">
        <p className="text-purple-100 text-sm">₹{format(number)} + {percent}% (₹{format(added)})</p>
        <p className="text-3xl font-bold">₹{format(result)}</p>
      </div>
    </div>
  )
}

/* ── Calculator 5: Remove percentage from number ── */
export function RemovePercent() {
  const [number, setNumber] = useState(1180)
  const [percent, setPercent] = useState(18)
  const result = Number(number) / (1 + Number(percent) / 100)
  const removed = Number(number) - result
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-800 mb-1">Remove % from a Number</h2>
      <p className="text-xs text-gray-400 mb-4">Example: Price with 18% GST included — what is the original price?</p>
      <InputBox label="Amount with % included" value={number} setValue={setNumber} prefix="₹" />
      <InputBox label="Percentage to Remove" value={percent} setValue={setPercent} suffix="%" />
      <div className="bg-amber-500 rounded-xl p-4 text-white mt-2">
        <p className="text-amber-100 text-sm">Original price before {percent}% (removed ₹{format(removed)})</p>
        <p className="text-3xl font-bold">₹{format(result)}</p>
      </div>
    </div>
  )
}

/* ── Calculator 6: Discount Calculator ── */
export function DiscountCalculator() {
  const [price, setPrice] = useState(2000)
  const [discount, setDiscount] = useState(20)
  const saved = (Number(discount) / 100) * Number(price)
  const finalPrice = Number(price) - saved
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-800 mb-1">Discount Calculator</h2>
      <p className="text-xs text-gray-400 mb-4">Example: ₹2000 product with 20% discount</p>
      <InputBox label="Original Price (MRP)" value={price} setValue={setPrice} prefix="₹" />
      <InputBox label="Discount %" value={discount} setValue={setDiscount} suffix="%" />
      <div className="bg-blue-600 rounded-xl p-4 text-white mt-2">
        <p className="text-blue-100 text-sm mb-1">Final Price after {discount}% off</p>
        <p className="text-3xl font-bold mb-2">₹{format(finalPrice)}</p>
        <div className="flex gap-4 text-sm">
          <div><p className="text-blue-200 text-xs">You Save</p><p className="font-bold">₹{format(saved)}</p></div>
          <div><p className="text-blue-200 text-xs">Original</p><p className="font-bold">₹{format(price)}</p></div>
        </div>
      </div>
    </div>
  )
}

/* ── Calculator 7: GST Calculator ── */
export function GSTCalculator() {
  const [amount, setAmount] = useState(1000)
  const [gstRate, setGstRate] = useState(18)
  const [mode, setMode] = useState("exclusive")

  let baseAmount, gstAmount, totalAmount
  if (mode === "exclusive") {
    baseAmount = Number(amount)
    gstAmount = (baseAmount * Number(gstRate)) / 100
    totalAmount = baseAmount + gstAmount
  } else {
    totalAmount = Number(amount)
    baseAmount = totalAmount / (1 + Number(gstRate) / 100)
    gstAmount = totalAmount - baseAmount
  }

  const gstRates = [0, 5, 12, 18, 28]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-800 mb-1">GST Calculator</h2>
      <p className="text-xs text-gray-400 mb-4">Calculate GST amount for any rate</p>

      <div className="flex gap-2 mb-4">
        {[{ val: "exclusive", label: "Add GST" }, { val: "inclusive", label: "Remove GST" }].map((o) => (
          <button key={o.val} type="button" onClick={() => setMode(o.val)}
            className={"flex-1 py-2 rounded-lg text-sm font-semibold transition " + (mode === o.val ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600")}>
            {o.label}
          </button>
        ))}
      </div>

      <InputBox label={mode === "exclusive" ? "Amount (before GST)" : "Amount (GST included)"} value={amount} setValue={setAmount} prefix="₹" />

      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 block mb-2">GST Rate</label>
        <div className="flex gap-2 flex-wrap">
          {gstRates.map((r) => (
            <button key={r} type="button" onClick={() => setGstRate(r)}
              className={"px-4 py-1.5 rounded-lg text-sm font-semibold transition " + (gstRate === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              {r}%
            </button>
          ))}
        </div>
      </div>

      <div className="bg-green-600 rounded-xl p-4 text-white mt-2">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><p className="text-green-100 text-xs mb-1">Base Amount</p><p className="font-bold text-lg">₹{format(baseAmount)}</p></div>
          <div><p className="text-green-100 text-xs mb-1">GST ({gstRate}%)</p><p className="font-bold text-lg">₹{format(gstAmount)}</p></div>
          <div><p className="text-green-100 text-xs mb-1">Total</p><p className="font-bold text-lg">₹{format(totalAmount)}</p></div>
        </div>
      </div>
    </div>
  )
}

/* ── Calculator 8: Marks / Grade Percentage ── */
export function MarksCalculator() {
  const [obtained, setObtained] = useState(450)
  const [total, setTotal] = useState(600)
  const percentage = (Number(obtained) / Number(total)) * 100
  const getGrade = (p) => {
    if (p >= 90) return { grade: "O (Outstanding)", color: "text-green-600" }
    if (p >= 80) return { grade: "A+ (Excellent)", color: "text-green-600" }
    if (p >= 70) return { grade: "A (Very Good)", color: "text-blue-600" }
    if (p >= 60) return { grade: "B+ (Good)", color: "text-blue-600" }
    if (p >= 50) return { grade: "B (Average)", color: "text-amber-600" }
    if (p >= 40) return { grade: "C (Pass)", color: "text-amber-600" }
    return { grade: "F (Fail)", color: "text-red-600" }
  }
  const { grade, color } = getGrade(percentage)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-800 mb-1">Marks / Grade Percentage</h2>
      <p className="text-xs text-gray-400 mb-4">Calculate percentage of marks scored</p>
      <InputBox label="Marks Obtained" value={obtained} setValue={setObtained} />
      <InputBox label="Total Marks" value={total} setValue={setTotal} />
      <div className="bg-purple-600 rounded-xl p-4 text-white mt-2">
        <p className="text-purple-100 text-sm">{format(obtained)} out of {format(total)}</p>
        <p className="text-3xl font-bold mb-1">{format(percentage)}%</p>
        <p className={`text-sm font-semibold bg-white rounded-lg px-3 py-1 inline-block ${color}`}>{grade}</p>
      </div>
    </div>
  )
}

/* ── Generic FAQ accordion (pass in faqs: [{q, a}]) ── */
export function FaqAccordion({ faqs }) {
  const [open, setOpen] = useState(null)
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

/* ── Generic FAQ schema (pass in faqs: [{q, a}]) ── */
export function FaqSchema({ faqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

/* ── Related calculators nav block — put near the bottom of every focused page ── */
export const ALL_CALCULATORS = [
  { href: "/percentage-calculator", label: "All Percentage Calculators" },
  { href: "/discount-calculator", label: "Discount Calculator" },
  { href: "/gst-calculator", label: "GST Calculator" },
  { href: "/percentage-increase-calculator", label: "Percentage Increase / Decrease" },
  { href: "/marks-percentage-calculator", label: "Marks Percentage Calculator" },
]

export function RelatedCalculators({ exclude }) {
  const items = ALL_CALCULATORS.filter((c) => c.href !== exclude)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="font-bold text-gray-900 text-lg mb-3">Related Calculators</h2>
      <div className="flex flex-col gap-2">
        {items.map((c) => (
          <Link key={c.href} to={c.href} className="text-sm text-blue-600 hover:underline">
            {c.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}