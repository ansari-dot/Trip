import { Link } from "react-router-dom";
import { Mountain, ChevronDown, CheckCircle, ShieldCheck, Map, Compass } from "lucide-react";
import logo from "../../assets/logo.png";

export default function JeepSafari() {
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
              <Link to="/services/jeep-safari" className="px-4 py-3 bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5 text-lux-accent">Jeep Safari</Link>
              <Link to="/services/accommodation" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Accommodation</Link>
              <Link to="/services/tour-guide" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Tour Guide</Link>
              <Link to="/services/car-rent" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs">Jeep/Car Rent</Link>
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
          <Mountain className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-4">Ultimate Adventure</div>
          <h1 className="font-headings text-4xl sm:text-5xl lg:text-6xl text-lux-primary mb-6">
            Thrilling <span className="text-lux-accent italic font-light">Jeep Safaris</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Conquer the untamed beauty of Northern Pakistan. Our premium 4x4 Jeep Safaris take you off the beaten path safely and comfortably.
          </p>
          <Link to="/request-quote?service=Jeep Safari" className="inline-block bg-lux-primary text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-lux-accent transition-colors">
            Inquire Now
          </Link>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headings text-4xl sm:text-5xl text-lux-primary">Uncharted Territories</h2>
            <div className="w-24 h-1 bg-lux-accent mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Compass className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Expert Local Drivers</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Our drivers are seasoned professionals who know every curve and terrain of the Karakoram and Himalayan ranges.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <ShieldCheck className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Premium 4x4 Vehicles</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Travel in well-maintained, heavy-duty off-road vehicles equipped for maximum safety and comfort during rugged journeys.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Map className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Exclusive Routes</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">We take you to pristine locations inaccessible by standard transport, including Fairy Meadows, Deosai Plains, and Khunjerab Pass.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-lux-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-lux-accent/20 translate-x-4 translate-y-4 rounded-sm"></div>
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1600" alt="Jeep Safari" className="relative rounded-sm shadow-2xl w-full h-[600px] object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-lux-accent text-sm uppercase tracking-[0.2em] font-bold mb-4">The Real North</div>
            <h2 className="font-headings text-4xl sm:text-5xl lg:text-6xl text-lux-primary leading-tight mb-8">Access the Inaccessible</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              Standard tours only scratch the surface. A Jeep Safari allows you to penetrate deep into the heart of the mountains, where the true magic of Pakistan resides.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Customizable Itineraries</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Choose between half-day excursions or multi-day cross-valley expeditions based on your comfort level.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Photography Stops</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Our drivers know exactly where and when to stop for the most breathtaking, unobstructed views of the peaks.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Safety Gear Provided</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">All vehicles are equipped with emergency kits, satellite communications (in remote areas), and spare parts.</p>
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
            <Link to="/services/accommodation" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Accommodation</Link>
            <Link to="/services/tour-guide" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Tour Guide</Link>
            <Link to="/services/car-rent" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Jeep/Car Rent</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-lux-primary text-white text-center px-6 mt-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headings text-4xl sm:text-5xl mb-6">Ready for the Wild?</h2>
          <p className="text-lg opacity-90 font-light mb-10">
            Secure your 4x4 Jeep Safari today and experience the Karakoram like never before.
          </p>
          <Link to="/request-quote?service=Jeep Safari" className="inline-block bg-lux-accent text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-white hover:text-lux-primary transition-colors">
            Get Safari Quotes
          </Link>
        </div>
      </section>
    </div>
  );
}
