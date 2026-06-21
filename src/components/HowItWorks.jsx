import { Link } from "react-router-dom";

const steps = [
  {
    step: "1",
    title: "Pick a tool",
    desc: "Choose from EMI, salary, HRA or FD calculator",
  },
  {
    step: "2",
    title: "Enter your numbers",
    desc: "Fill in your loan amount, salary or investment details",
  },
  {
    step: "3",
    title: "Get instant results",
    desc: "See your exact figures in seconds, no signup needed",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-16 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Finance Blog</h3>
        <p className="text-gray-500 text-sm mb-4">
          Simple money articles for Indians — EMI tips, salary guides,
          investment advice
        </p>
        <Link
          to="/blog"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Read Articles →
        </Link>
      </div>
    </section>
  );
}
