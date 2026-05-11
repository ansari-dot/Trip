import { Link } from "react-router-dom";
import { Compass, ChevronDown, CheckCircle, Users, ShieldCheck, HeartHandshake } from "lucide-react";
import logo from "../../assets/logo.png";

export default function TourGuide() {
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
              <Link to="/services/tour-guide" className="px-4 py-3 bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5 text-lux-accent">Tour Guide</Link>
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
          <Compass className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-4">Local Expertise</div>
          <h1 className="font-headings text-4xl sm:text-5xl lg:text-6xl text-lux-primary mb-6">
            Expert <span className="text-lux-accent italic font-light">Tour Guides</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            A destination is only as rich as the stories told about it. Our certified, multilingual guides transform a simple trip into an unforgettable journey.
          </p>
          <Link to="/request-quote?service=Tour Guide" className="inline-block bg-lux-primary text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-lux-accent transition-colors">
            Inquire Now
          </Link>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headings text-4xl sm:text-5xl text-lux-primary">Beyond the Guidebook</h2>
            <div className="w-24 h-1 bg-lux-accent mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Users className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Local Knowledge</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Our guides are passionate locals with deep roots in the region, ensuring highly authentic experiences and meaningful cultural interactions.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <ShieldCheck className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Safety First</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Trained in wilderness first aid and risk management, your safety is their absolute highest priority during remote treks and active tours.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <HeartHandshake className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Tailored Experiences</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Whether you are interested in ancient history, wildlife photography, or extreme trekking, we match you with a guide who shares your exact passion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-lux-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-lux-accent/20 translate-x-4 translate-y-4 rounded-sm"></div>
            <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=1600" alt="Tour Guide" className="relative rounded-sm shadow-2xl w-full h-[600px] object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-lux-accent text-sm uppercase tracking-[0.2em] font-bold mb-4">Your Personal Host</div>
            <h2 className="font-headings text-4xl sm:text-5xl lg:text-6xl text-lux-primary leading-tight mb-8">More Than Just Navigation</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              When you travel with North Paradise, your guide acts as your personal concierge, translator, and local ambassador. They handle the logistics so you can focus entirely on the experience.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Language Support</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Fluent in English, Urdu, and regional languages like Shina and Balti to break down any language barriers seamlessly.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Hidden Gems</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">They'll take you to spots rarely seen by standard tourists—hidden waterfalls, local artisans, and secret viewpoints.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lux-accent mt-1 shrink-0" />
                <div>
                  <h4 className="text-lux-primary font-bold text-lg mb-1">Logistical Mastery</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">From handling permits for restricted areas to organizing last-minute itinerary adjustments flawlessly.</p>
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
            <Link to="/services/car-rent" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Jeep/Car Rent</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-lux-primary text-white text-center px-6 mt-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headings text-4xl sm:text-5xl mb-6">Enrich Your Journey</h2>
          <p className="text-lg opacity-90 font-light mb-10">
            Don't just see the North—understand it. Contact us to find the perfect guide for your upcoming trip.
          </p>
          <Link to="/request-quote?service=Tour Guide" className="inline-block bg-lux-accent text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-white hover:text-lux-primary transition-colors">
            Get Guide Quotes
          </Link>
        </div>
      </section>
    </div>
  );
}
