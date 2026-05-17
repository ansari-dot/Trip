import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Landing from "./pages/Landing";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import TourPackages from "./pages/TourPackages";
import TourPackageDetail from "./pages/TourPackageDetail";
import About from "./pages/About";
import RequestQuote from "./pages/RequestQuote";
import AirTicketing from "./pages/services/AirTicketing";
import JeepSafari from "./pages/services/JeepSafari";
import Accommodation from "./pages/services/Accommodation";
import TourGuide from "./pages/services/TourGuide";
import CarRent from "./pages/services/CarRent";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import FAQ from "./pages/FAQ";
import Footer from "./components/Footer";
import PromoModal from "./components/PromoModal";
import TripPlannerChat from "./components/TripPlannerChat";

/** Reset window scroll when the route path changes (SPA default). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetail />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/tour-packages" element={<TourPackages />} />
              <Route path="/tour-packages/:id" element={<TourPackageDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/request-quote" element={<RequestQuote />} />
              <Route path="/services/air-ticketing" element={<AirTicketing />} />
              <Route path="/services/jeep-safari" element={<JeepSafari />} />
              <Route path="/services/accommodation" element={<Accommodation />} />
              <Route path="/services/tour-guide" element={<TourGuide />} />
              <Route path="/services/car-rent" element={<CarRent />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/help-center" element={<FAQ />} />
            </Routes>
          </main>
          <Footer />
          <PromoModal />
        </div>
        <TripPlannerChat />
      </BrowserRouter>
    </HelmetProvider>
  );
}
