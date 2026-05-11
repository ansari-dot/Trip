import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import logo from "../assets/logo_old.png";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/$/, "");

async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function Navbar() {
  const location = useLocation();
  const isContactPage = location.pathname === "/contact" || location.pathname === "/about" || location.pathname === "/tour-packages" || location.pathname === "/destinations";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dynamicTourTypes, setDynamicTourTypes] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadTourTypes = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/tour-types`);
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setDynamicTourTypes(data.data);
        }
      } catch { /* silent */ }
    };
    void loadTourTypes();
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-[999] transition-all duration-300 text-white ${(isScrolled || isContactPage || isMenuOpen) ? 'py-1.5 sm:py-2 bg-lux-primary shadow-md border-b border-white/5' : 'py-2 sm:py-3 bg-transparent'}`}>
      <div className="max-w-full px-6 sm:px-12 grid grid-cols-2 sm:grid-cols-3 items-center">
        {/* Logo (Left) */}
        <div className="flex items-center">
          <Link to="/" className="relative z-[110]">
            <img src={logo} alt="North Paradise" className="h-14 sm:h-20 w-auto object-contain transition-transform duration-500 hover:scale-105" />
          </Link>
        </div>

        {/* Desktop Navigation (Center) */}
        <nav className="hidden sm:flex gap-8 text-sm uppercase tracking-widest items-center justify-center">
          <Link to="/destinations" className="hover:text-lux-accent transition-colors">Destinations</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-lux-accent transition-colors uppercase tracking-widest text-sm focus:outline-none">
              Tours <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-lux-primary/95 backdrop-blur-sm border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col shadow-xl z-50 text-white text-left">
              {dynamicTourTypes.length > 0 ? dynamicTourTypes.map((type) => (
                <Link
                  key={type._id}
                  to={`/tour-packages?type=${encodeURIComponent(type.name)}`}
                  className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5"
                >
                  {type.name} Tours
                </Link>
              )) : (
                <>
                  <Link to="/tour-packages?type=Adventure" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Adventure Tours</Link>
                  <Link to="/tour-packages?type=Cultural" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Cultural Tours</Link>
                </>
              )}
              <Link to="/tour-packages" className="px-4 py-3 bg-lux-accent/20 hover:bg-lux-accent/30 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold text-center">View All Packages</Link>
            </div>
          </div>
          <Link to="/about" className="hover:text-lux-accent transition-colors">About</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-lux-accent transition-colors uppercase tracking-widest text-sm focus:outline-none">
              Services <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-lux-primary/95 backdrop-blur-sm border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col shadow-xl z-50 text-white text-left">
              {[
                { name: "Air Ticketing", path: "/services/air-ticketing" },
                { name: "Jeep Safari", path: "/services/jeep-safari" },
                { name: "Accommodation", path: "/services/accommodation" },
                { name: "Tour Guide", path: "/services/tour-guide" },
                { name: "Car Rental", path: "/services/car-rent" }
              ].map((service) => (
                <Link
                  key={service.path}
                  to={service.path}
                  className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5 last:border-0"
                >
                  {service.name}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/contact" className="hover:text-lux-accent transition-colors">Contact</Link>
        </nav>

        {/* Desktop CTA & Mobile Toggle (Right) */}
        <div className="flex items-center justify-end gap-6">
          <Link to="/request-quote" className="hidden sm:block bg-lux-accent text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
            Customize Trip
          </Link>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden relative z-[110] w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-lux-accent transition-all duration-300 group"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`sm:hidden fixed inset-0 bg-lux-primary z-[100] transition-all duration-700 ease-in-out ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
        <div className="pt-32 pb-12 px-8 h-full flex flex-col overflow-y-auto">
          <nav className="flex flex-col gap-8 mb-12">
            {[
              { name: "Destinations", path: "/destinations", type: "link" },
              { name: "Tours", type: "dropdown", id: "tours" },
              { name: "About", path: "/about", type: "link" },
              { name: "Services", type: "dropdown", id: "services" },
              { name: "Contact", path: "/contact", type: "link" }
            ].map((item, i) => (
              <div 
                key={item.name} 
                style={{ transitionDelay: `${i * 100}ms` }}
                className={`transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
              >
                {item.type === "link" ? (
                  <Link to={item.path!} className="text-base font-headings border border-white/10 bg-white/5 px-5 py-3.5 flex items-center justify-between hover:bg-lux-accent/20 transition-all group">
                    {item.name}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id!)}
                      className={`w-full flex justify-between items-center text-base font-headings border px-5 py-3.5 transition-all ${activeDropdown === item.id ? 'bg-lux-accent/20 border-lux-accent' : 'bg-white/5 border-white/10'}`}
                    >
                      {item.name} <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === item.id && (
                      <div className="pl-4 flex flex-col gap-2 pt-2 animate-in slide-in-from-left-4 duration-300">
                        {item.id === "tours" ? (
                          <>
                            <Link to="/tour-packages" className="bg-lux-accent/10 border border-lux-accent/20 px-5 py-3 text-lux-accent flex items-center justify-between text-sm">
                              All Packages <ArrowRight className="w-4 h-4" />
                            </Link>
                            {dynamicTourTypes.map(t => (
                              <Link key={t._id} to={`/tour-packages?type=${encodeURIComponent(t.name)}`} className="bg-white/5 border border-white/5 px-5 py-3 opacity-70 text-sm">{t.name} Tours</Link>
                            ))}
                          </>
                        ) : (
                          <>
                            {[
                              { name: "Air Ticketing", path: "/services/air-ticketing" },
                              { name: "Jeep Safari", path: "/services/jeep-safari" },
                              { name: "Accommodation", path: "/services/accommodation" },
                              { name: "Tour Guide", path: "/services/tour-guide" },
                              { name: "Car Rental", path: "/services/car-rent" }
                            ].map(s => (
                              <Link key={s.path} to={s.path} className="bg-white/5 border border-white/5 px-5 py-3 opacity-70 text-sm">{s.name}</Link>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className={`mt-auto transition-all duration-700 delay-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Link to="/request-quote" className="bg-lux-accent text-white py-6 block text-center text-sm uppercase tracking-[0.3em] font-bold">
              Plan Your Journey
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
