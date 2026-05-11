import { Link } from "react-router-dom";
import { Compass, ShieldCheck, Headset, Star, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png";

export default function About() {
  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <header className="w-full z-10 flex flex-col sm:flex-row justify-between items-center px-6 sm:px-12 py-3 bg-lux-primary text-white gap-4">
        <div className="flex items-center">
          <Link to="/">
            <img src={logo} alt="North Paradise" className="-my-4 h-24 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex gap-4 sm:gap-8 text-sm uppercase tracking-widest flex-wrap justify-center">
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
          <Link to="/about" className="text-lux-accent transition-colors hover:text-lux-accent">About</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-lux-accent transition-colors uppercase tracking-widest text-sm focus:outline-none">
              Services <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-lux-primary/95 backdrop-blur-sm border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col shadow-xl z-50 text-white text-left">
              <Link to="/services/air-ticketing" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Air Ticketing</Link>
              <Link to="/services/jeep-safari" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Jeep Safari</Link>
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

      <section
        className="relative h-[60vh] min-h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <div className="text-lux-accent text-sm uppercase tracking-widest mb-4 font-medium">
            Our Story
          </div>
          <h1 className="font-headings text-5xl sm:text-7xl mb-6">
            Beyond the Ordinary
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
            Elevating travel into an art form. We design bespoke, immersive journeys for the world's most discerning explorers taking you to the untouched edges of our beautiful world.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 px-6 sm:px-12 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
          <div>
            <h2 className="font-headings text-3xl sm:text-4xl mb-6">Redefining Luxury Travel</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6 font-light">
              Founded in 2010 by a collective of seasoned globetrotters and luxury concierges, North Paradise was born out of a simple observation: true luxury is no longer just about five-star amenities—it's about exclusive access, authentic connections, and flawless execution.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-light">
              We leverage our global network of experts, private guides, and elite hospitality partners to craft itineraries that simply cannot be found anywhere else. Every detail, from the moment you step out of your home to your reluctant return, is curated perfectly to your unique travel palate.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border mt-8">
              <div>
                <p className="font-headings text-4xl text-lux-primary mb-2">50+</p>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Countries Explored</p>
              </div>
              <div>
                <p className="font-headings text-4xl text-lux-primary mb-2">12k+</p>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Curated Journeys</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1540544520970-22edbf9031ef?auto=format&fit=crop&q=80&w=1200"
              alt="Luxury Safari Experience"
              className="rounded-sm shadow-2xl w-full"
            />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-lux-primary text-white p-8 rounded-sm hidden md:flex flex-col justify-center shadow-xl">
              <Star className="w-8 h-8 text-lux-accent mb-4" />
              <p className="font-headings text-xl">Award-Winning Travel Design</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="font-headings text-3xl sm:text-4xl mb-4">The North Paradise Promise</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            What separates us from traditional agencies is our unwavering dedication to the invisible details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 border border-border rounded-sm hover:-translate-y-1 transition-transform duration-300">
            <Compass className="w-10 h-10 text-lux-accent mb-6" />
            <h3 className="font-headings text-xl mb-4">Bespoke Curation</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No two journeys are the same. We take the time to understand your rhythm, your passions, and your desires to build an itinerary entirely from scratch.
            </p>
          </div>
          <div className="bg-white p-10 border border-border rounded-sm hover:-translate-y-1 transition-transform duration-300">
            <ShieldCheck className="w-10 h-10 text-lux-accent mb-6" />
            <h3 className="font-headings text-xl mb-4">Private Access</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Skip the lines and avoid the crowds. We provide exclusive after-hours access to historical sites, private viewings, and VIP reservations globally.
            </p>
          </div>
          <div className="bg-white p-10 border border-border rounded-sm hover:-translate-y-1 transition-transform duration-300">
            <Headset className="w-10 h-10 text-lux-accent mb-6" />
            <h3 className="font-headings text-xl mb-4">24/7 Global Support</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your dedicated travel concierge monitors your journey in real-time, proactively managing your flights, connections, and unexpected weather shifts seamlessly.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-lux-primary text-white py-24 px-6 sm:px-12 text-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-headings text-3xl sm:text-5xl mb-6">Ready to Experience the Extraordinary?</h2>
          <p className="text-lg opacity-80 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            Speak with one of our expert advisors to begin drafting your next unforgettable journey.
          </p>
          <Link to="/request-quote" className="bg-lux-accent text-white px-8 py-4 rounded-sm uppercase tracking-widest hover:bg-white hover:text-lux-primary transition-colors font-medium inline-block">
            Schedule a Consultation
          </Link>
        </div>
      </section>

    </div>
  );
}
