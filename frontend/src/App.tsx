import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
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
import Footer from "./components/Footer";
import PromoModal from "./components/PromoModal";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:id" element={<DestinationDetail />} />
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
          </Routes>
        </main>
        <Footer />
        <PromoModal />
      </div>
    </BrowserRouter>
  );
}