import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Tools from "./components/Tools";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import EMICalculator from "./pages/EMICalculator";
import FDCalculator from "./pages/FDCalculator";
import HRACalculator from "./pages/HRACalculator";
import SalaryCalculator from "./pages/SalaryCalculator";
import PercentageCalculator from "./pages/PercentageCalculator";
import DiscountCalculator from "./pages/DiscountCalculator";
import GSTCalculator from "./pages/GSTCalculator";
import PercentageIncreaseCalculator from "./pages/PercentageIncreaseCalculator";
import MarksCalculator from "./pages/MarksCalculator";
import BlogHome from "./pages/blog/BlogHome";
import BlogPost from "./pages/blog/BlogPost";
import { Helmet } from "react-helmet-async";
import ScrollToTop from "./components/ScrollToTop";

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <link rel="canonical" href="https://webext.in/" />
      </Helmet>
      <Navbar />
      <Hero />
      <Tools />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/emi-calculator" element={<EMICalculator />} />
        <Route path="/salary-calculator" element={<SalaryCalculator />} />
        <Route path="/hra-calculator" element={<HRACalculator />} />
        <Route path="/fd-calculator" element={<FDCalculator />} />
        <Route
          path="/percentage-calculator"
          element={<PercentageCalculator />}
        />
        <Route path="/discount-calculator" element={<DiscountCalculator />} />
        <Route path="/gst-calculator" element={<GSTCalculator />} />
        <Route
          path="/percentage-increase-calculator"
          element={<PercentageIncreaseCalculator />}
        />
        <Route
          path="/marks-percentage-calculator"
          element={<MarksCalculator />}
        />
        <Route path="/blog" element={<BlogHome />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </BrowserRouter>
  );
}