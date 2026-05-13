import { Link } from "react-router-dom";
import { Plane, ChevronDown, CheckCircle, ShieldCheck, Globe, Headphones } from "lucide-react";
import logo from "../../assets/logo1.png";
import SEO from "../../components/SEO";

import Navbar from "../../components/Navbar";

export default function AirTicketing() {
  return (
    <div className="bg-lux-bg font-body text-lux-primary min-h-screen flex flex-col">
      <SEO 
        title="Air Ticketing Services | Domestic & International Flights Pakistan"
        description="Book your flights to Northern Pakistan with ease. We offer domestic and international air ticketing services with premium support."
        keywords="air ticketing Pakistan, flights to Gilgit, flights to Skardu, PIA bookings, domestic flights Pakistan"
      />
      <Navbar />


      {/* Hero */}
      <section 
        className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=2000')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
          <Plane className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-4">First Class Travel</div>
          <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Global <span className="text-lux-accent italic font-light">Air Ticketing</span>
          </h1>
          <p className="text-lg opacity-90 leading-relaxed max-w-2xl mx-auto mb-10">
            Seamless travel starts with seamless flights. Let our expert concierges handle your flight arrangements with absolute perfection.
          </p>
          <Link to="/request-quote?service=Air Ticketing" className="inline-block bg-lux-primary text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-lux-accent transition-colors">
            Inquire Now
          </Link>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-headings text-4xl sm:text-5xl text-lux-primary">Why Book With Us?</h2>
            <div className="w-24 h-1 bg-lux-accent mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Globe className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Global Network</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">We partner with top-tier airlines worldwide to ensure you have access to the best routes and direct flights to Pakistan and beyond.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <ShieldCheck className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Secure Bookings</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Your bookings are fully protected. We offer flexible cancellation policies and comprehensive travel insurance options.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Headphones className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">24/7 Concierge</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Flight delayed? Need to change dates? Our dedicated support team is available 24/7 to handle any unexpected changes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-14 sm:py-24 bg-lux-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-lux-accent/20 translate-x-4 translate-y-4 rounded-sm"></div>
            <img src="https://images.unsplash.com/photo-1540339832862-4745898ca1cb?auto=format&fit=crop&q=80&w=1600" alt="Airport Lounge" className="relative rounded-sm shadow-2xl w-full min-h-[200px] h-[min(52vh,24rem)] sm:h-[600px] object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-lux-accent text-sm uppercase tracking-[0.2em] font-bold mb-4">Premium Experience</div>
            <h2 className="font-headings text-4xl sm:text-5xl lg:text-6xl text-lux-primary leading-tight mb-8">Elevating Every Aspect of Your Journey</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              We believe that your vacation begins the moment you leave your home. Our air ticketing service is designed to remove all the stress and hassle typically associated with booking flights.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Preferred Seating</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">We secure the exact seats you want, whether it's extra legroom or a window view for the scenic landing.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Special Requirements</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Dietary requirements and mobility assistance are communicated and confirmed with airlines well in advance.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Lounge Access</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">We arrange premium airport lounge access for a relaxing, luxurious pre-flight experience away from the crowds.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-14 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-headings text-3xl sm:text-4xl text-lux-primary mb-12">Explore Other Services</h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/services/jeep-safari" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Jeep Safari</Link>
            <Link to="/services/accommodation" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Accommodation</Link>
            <Link to="/services/tour-guide" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Tour Guide</Link>
            <Link to="/services/car-rent" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Jeep/Car Rent</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-24 bg-lux-primary text-white text-center px-6 mt-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headings text-4xl sm:text-5xl mb-6">Ready for Takeoff?</h2>
          <p className="text-lg opacity-90 font-light mb-10">
            Contact our travel experts today to find the perfect flights for your next adventure.
          </p>
          <Link to="/request-quote?service=Air Ticketing" className="inline-block bg-lux-accent text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-white hover:text-lux-primary transition-colors">
            Get Flight Quotes
          </Link>
        </div>
      </section>
    </div>
  );
}
