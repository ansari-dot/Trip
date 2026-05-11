import { Link } from "react-router-dom";
import { Compass, ChevronDown, CheckCircle, ShieldCheck, Map, Clock } from "lucide-react";
import logo from "../../assets/logo.png";

export default function CarRent() {
  return (
    <div className="bg-lux-bg font-body text-lux-primary min-h-screen flex flex-col">
      <header className="w-full z-50 flex flex-col sm:flex-row justify-between items-center px-6 sm:px-12 py-3 bg-lux-primary text-white gap-4">
        <div className="flex items-center">
          <Link to="/">
            <img src={logo} alt="North Paradise" className="-my-4 h-24 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex gap-4 sm:gap-8 text-sm uppercase tracking-widest flex-wrap justify-center text-white">
          <Link to="/destinations" className="hover:text-lux-accent transition-colors">Destinations</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-lux-accent transition-colors uppercase tracking-widest text-sm focus:outline-none">
              Tour Packages <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-lux-primary/95 backdrop-blur-sm border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col shadow-xl z-50 text-white text-left">
              <Link to="/tour-packages?type=Adventure" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Adventure Tours</Link>
              <Link to="/tour-packages?type=Cultural" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Cultural Tours</Link>
              <Link to="/tour-packages?type=Honeymoon" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Honeymoon Packages</Link>
              <Link to="/tour-packages?type=Family" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Family Tours</Link>
              <Link to="/tour-packages?type=Religious" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Religious Tours</Link>
              <Link to="/tour-packages" className="px-4 py-3 bg-lux-accent/20 hover:bg-lux-accent/30 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold text-center">View All Packages</Link>
            </div>
          </div>
          <Link to="/about" className="hover:text-lux-accent transition-colors">About</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 text-lux-accent transition-colors uppercase tracking-widest text-sm focus:outline-none">
              Services <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-lux-primary/95 backdrop-blur-sm border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col shadow-xl z-50 text-white text-left">
              <Link to="/services/air-ticketing" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Air Ticketing</Link>
              <Link to="/services/jeep-safari" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Jeep Safari</Link>
              <Link to="/services/accommodation" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Accommodation</Link>
              <Link to="/services/tour-guide" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Tour Guide</Link>
              <Link to="/services/car-rent" className="px-4 py-3 bg-white/10 transition-colors uppercase tracking-widest text-xs text-lux-accent">Jeep/Car Rent</Link>
            </div>
          </div>
          <Link to="/contact" className="hover:text-lux-accent transition-colors">Contact</Link>
        </nav>
        <Link to="/request-quote" className="bg-lux-accent text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
          Customize Trip
        </Link>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Map className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-4">Travel in Style</div>
          <h1 className="font-headings text-4xl sm:text-5xl lg:text-6xl text-lux-primary mb-6">
            Premium <span className="text-lux-accent italic font-light">Vehicle Rentals</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Navigate the stunning landscapes of Northern Pakistan at your own pace. Choose from our fleet of luxury SUVs, rugged 4x4s, and comfortable sedans.
          </p>
          <Link to="/request-quote?service=Car Rental" className="inline-block bg-lux-primary text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-lux-accent transition-colors">
            Inquire Now
          </Link>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headings text-4xl sm:text-5xl text-lux-primary">Drive with Confidence</h2>
            <div className="w-24 h-1 bg-lux-accent mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <ShieldCheck className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Immaculate Fleet</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Our vehicles undergo rigorous safety inspections, maintenance checks, and daily detailing to ensure a flawless driving experience.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Compass className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Chauffeur Services</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Prefer not to drive? Hire one of our discrete, professional chauffeurs who are intimately familiar with local mountain routes and terrain.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Clock className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Flexible Terms</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">From simple daily rentals to month-long leases, we offer highly flexible terms that perfectly suit your specific itinerary and requirements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-lux-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-lux-accent/20 translate-x-4 translate-y-4 rounded-sm"></div>
            <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1600" alt="Luxury Driving" className="relative rounded-sm shadow-2xl w-full h-[600px] object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-lux-accent text-sm uppercase tracking-[0.2em] font-bold mb-4">Uncompromising Standard</div>
            <h2 className="font-headings text-4xl sm:text-5xl lg:text-6xl text-lux-primary leading-tight mb-8">The Perfect Vehicle for Every Journey</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              Whether you need a high-clearance 4x4 to tackle the rocky paths of Deosai, or a luxury sedan for a comfortable transfer from the airport to your hotel, we have you covered.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Luxury SUVs</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Premium models like the Toyota Land Cruiser Prado for maximum comfort and capability in any terrain.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Door-to-Door Delivery</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">We can deliver the rental vehicle directly to your hotel or have it waiting at the airport upon arrival.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">24/7 Roadside Assistance</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Drive with absolute peace of mind knowing our support team is just a phone call away, anywhere in the region.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-headings text-3xl sm:text-4xl text-lux-primary mb-12">Explore Other Services</h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/services/air-ticketing" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Air Ticketing</Link>
            <Link to="/services/jeep-safari" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Jeep Safari</Link>
            <Link to="/services/accommodation" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Accommodation</Link>
            <Link to="/services/tour-guide" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Tour Guide</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-lux-primary text-white text-center px-6 mt-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headings text-4xl sm:text-5xl mb-6">Start Your Engines</h2>
          <p className="text-lg opacity-90 font-light mb-10">
            Contact us today to secure the ideal vehicle for your Northern Pakistan expedition.
          </p>
          <Link to="/request-quote?service=Car Rental" className="inline-block bg-lux-accent text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-white hover:text-lux-primary transition-colors">
            Get Rental Quotes
          </Link>
        </div>
      </section>
    </div>
  );
}
