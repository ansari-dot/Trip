import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
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

/** Hamburger → X; minimal motion (instant). */
function LuxMenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-6 shrink-0" aria-hidden>
      <span
        className={`absolute left-0 h-[2.5px] w-full rounded-full ${open
          ? "top-[9px] rotate-45 bg-lux-accent"
          : "top-0.5 bg-gradient-to-r from-lux-accent via-amber-200 to-lux-bg"
          }`}
      />
      <span
        className={`absolute left-0 top-[9px] h-[2.5px] w-full -translate-y-1/2 rounded-full bg-lux-bg/90 ${open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"}`}
      />
      <span
        className={`absolute left-0 h-[2.5px] w-full rounded-full ${open
          ? "bottom-[9px] -rotate-45 bg-gradient-to-r from-lux-bg to-lux-accent"
          : "bottom-0.5 bg-gradient-to-r from-lux-bg to-white/70"
          }`}
      />
    </span>
  );
}

export default function Navbar() {
  const location = useLocation();
  const isContactPage = location.pathname === "/contact" || location.pathname === "/about" || location.pathname === "/tour-packages" || location.pathname === "/destinations" || location.pathname === "/blogs";
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

  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-[999] transition-[background-color,box-shadow] duration-300 text-white pt-[max(0px,env(safe-area-inset-top))] border-b ${(isScrolled || isContactPage || isMenuOpen) ? 'py-2 sm:py-2 bg-lux-primary shadow-md border-white/5' : 'py-2 sm:py-3 bg-transparent border-transparent'}`}>
      <div className="max-w-full px-4 sm:px-8 lg:px-12 grid grid-cols-2 sm:grid-cols-3 items-center gap-2 min-h-[4rem] sm:min-h-0">
        {/* Logo (Left) — taller on mobile so it reads clearly next to the menu control */}
        <div className="flex items-center min-w-0">
          <Link to="/" className="relative z-[110]">
            <img src={logo} alt="North Paradise" className="h-14 w-auto max-w-[12.5rem] sm:h-16 sm:max-w-none md:h-20 object-contain object-left transition-transform duration-500 hover:scale-105" />
          </Link>
        </div>

        {/* Desktop Navigation (Center) */}
        <nav className="hidden sm:flex gap-8 text-sm uppercase tracking-widest items-center justify-center">
          <Link to="/about" className="hover:text-lux-accent transition-colors">About</Link>
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
          <Link to="/blogs" className="hover:text-lux-accent transition-colors">Blogs</Link>
          <Link to="/contact" className="hover:text-lux-accent transition-colors">Contact</Link>
        </nav>

        {/* Desktop CTA & Mobile Toggle (Right) */}
        <div className="flex items-center justify-end gap-6">
          <Link to="/request-quote" className="hidden sm:block bg-lux-accent text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
            Customize Trip
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            className={`sm:hidden relative z-[110] flex h-11 w-11 items-center justify-center rounded-full border touch-manipulation ${isMenuOpen
              ? "border-lux-accent/60 bg-lux-accent/20"
              : "border-white/20 bg-white/10 hover:border-lux-accent/40 hover:bg-white/15"
              }`}
          >
            <LuxMenuIcon open={isMenuOpen} />
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="sm:hidden fixed inset-0 z-[100] flex flex-col bg-lux-primary"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(5rem+env(safe-area-inset-top))]">
            <p className="mb-6 text-center font-body text-[10px] font-semibold uppercase tracking-[0.35em] text-lux-accent/90">
              Menu
            </p>
            <nav className="flex flex-col gap-2.5">
              {[
                { name: "About", path: "/about", type: "link" as const },
                { name: "Destinations", path: "/destinations", type: "link" as const },
                { name: "Tours", type: "dropdown" as const, id: "tours" },
                { name: "Services", type: "dropdown" as const, id: "services" },
                { name: "Blogs", path: "/blogs", type: "link" as const },
                { name: "Contact", path: "/contact", type: "link" as const },
              ].map((item) => (
                <div key={item.name}>
                  {item.type === "link" ? (
                    <Link
                      to={item.path!}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 font-headings text-base text-lux-bg/95 hover:border-lux-accent/45 hover:bg-lux-accent/15"
                    >
                      {item.name}
                      <ArrowRight className="h-4 w-4 text-lux-accent opacity-0 group-hover:opacity-100" />
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id!)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left font-headings text-base ${activeDropdown === item.id
                          ? "border-lux-accent/60 bg-lux-accent/20 text-lux-bg"
                          : "border-white/10 bg-white/[0.06] text-lux-bg/95 hover:border-lux-accent/35 hover:bg-white/[0.1]"
                          }`}
                      >
                        {item.name}
                        <ChevronDown className={`h-4 w-4 shrink-0 text-lux-accent ${activeDropdown === item.id ? "rotate-180" : ""}`} />
                      </button>
                      {activeDropdown === item.id ? (
                        <div className="ml-1 flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-2">
                          {item.id === "tours" ? (
                            <>
                              <Link
                                to="/tour-packages"
                                className="flex items-center justify-between rounded-xl bg-lux-accent/20 px-3 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-lux-bg hover:bg-lux-accent/30"
                              >
                                All packages <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                              {dynamicTourTypes.map((t) => (
                                <Link
                                  key={t._id}
                                  to={`/tour-packages?type=${encodeURIComponent(t.name)}`}
                                  className="rounded-xl px-3 py-2 font-body text-sm text-lux-bg/75 hover:bg-white/10 hover:text-lux-bg"
                                >
                                  {t.name} tours
                                </Link>
                              ))}
                            </>
                          ) : (
                            <>
                              {[
                                { name: "Air Ticketing", path: "/services/air-ticketing" },
                                { name: "Jeep Safari", path: "/services/jeep-safari" },
                                { name: "Accommodation", path: "/services/accommodation" },
                                { name: "Tour Guide", path: "/services/tour-guide" },
                                { name: "Car Rental", path: "/services/car-rent" },
                              ].map((s) => (
                                <Link
                                  key={s.path}
                                  to={s.path}
                                  className="rounded-xl px-3 py-2 font-body text-sm text-lux-bg/75 hover:bg-white/10 hover:text-lux-bg"
                                >
                                  {s.name}
                                </Link>
                              ))}
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="relative mt-auto pt-6">
              <Link
                to="/request-quote"
                className="block rounded-2xl bg-lux-accent py-4 text-center font-body text-xs font-bold uppercase tracking-[0.28em] text-white hover:brightness-110"
              >
                Plan your journey
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
