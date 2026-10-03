const stats = [
  { number: "4+", label: "Free Tools" },
  { number: "100%", label: "Accurate" },
  { number: "0₹", label: "No Cost Ever" },
  { number: "Instant", label: "Results" }
]

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Free Finance Tools for Indians
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Know Your Numbers <br />
          <span className="text-blue-600">Before You Decide</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          EMI, salary, HRA, FD — get instant accurate calculations made for Indian finance. No signup, no cost.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#tools" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md">
            Use Free Tools
          </a>
          <a href="#how" className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors">
            How it works
          </a>
        </div>
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-blue-600">{s.number}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}