import { Search, Clock, Map, ChevronLeft, ChevronRight, X, LoaderCircle, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo1.png";
import { useState, useMemo, useEffect } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

type TourPackage = {
  id: string;
  title: string;
  destinations: string[];
  duration: string;
  price: string;
  image: string;
  type: string;
  description: string;
};

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/$/, "");

function getApiUrl(path: string) {
  return `${API_BASE}${path}`;
}

async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeTourPackage(input: unknown): TourPackage | null {
  if (!input || typeof input !== "object") return null;
  const t = input as TourPackage;
  if (!t.id || !t.title) return null;
  return {
    id: t.id,
    title: t.title,
    destinations: Array.isArray(t.destinations) ? t.destinations : [],
    duration: t.duration || "",
    price: t.price || "",
    image: t.image || "",
    type: t.type || "",
    description: t.description || "",
  };
}

const PAGE_SIZE = 6;

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left py-4 px-6 group border-b border-white/8 hover:bg-white/5 transition-colors"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-lux-accent">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 py-4 border-b border-white/8">{children}</div>}
    </div>
  );
}

export default function TourPackages() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("destination") || "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("type") ? [searchParams.get("type")!] : []
  );
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(999999);
  const [durationFilter, setDurationFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [allPackages, setAllPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dynamicTourTypes, setDynamicTourTypes] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setError("");
      try {
        const first = await fetch(getApiUrl("/api/tour-packages?page=1"));
        const firstData = await parseJsonSafely(first);
        if (!first.ok) { setError(firstData?.message || "Failed to load tour packages."); setAllPackages([]); return; }
        const totalPages: number = Math.max(Number(firstData?.totalPages) || 1, 1);
        const collected: TourPackage[] = (Array.isArray(firstData?.data) ? firstData.data.map(normalizeTourPackage).filter(Boolean) : []) as TourPackage[];
        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(getApiUrl(`/api/tour-packages?page=${i + 2}`)).then(parseJsonSafely)
            )
          );
          rest.forEach((data) => {
            if (Array.isArray(data?.data)) {
              (data.data.map(normalizeTourPackage).filter(Boolean) as TourPackage[]).forEach((p) => collected.push(p));
            }
          });
        }
        setAllPackages(collected);
      } catch {
        setError("Unable to load tour packages from the server.");
        setAllPackages([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadAll();
  }, []);

  useEffect(() => {
    const loadTourTypes = async () => {
      try {
        const response = await fetch(getApiUrl('/api/tour-types'));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setDynamicTourTypes(data.data);
        }
      } catch { /* silent */ }
    };
    void loadTourTypes();
  }, []);

  // init maxPrice once data loads
  useEffect(() => {
    if (allPackages.length > 0 && maxPrice === 999999) {
      const prices = allPackages.map((p) => parseInt(p.price.replace(/[^0-9]/g, ""))).filter((n) => !isNaN(n));
      if (prices.length > 0) setMaxPrice(Math.max(...prices));
    }
  }, [allPackages]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedTypes, selectedDestinations, maxPrice, durationFilter]);

  // dynamic filter options from real data
  const priceMax = useMemo(() => {
    const prices = allPackages.map((p) => parseInt(p.price.replace(/[^0-9]/g, ""))).filter((n) => !isNaN(n));
    return prices.length > 0 ? Math.max(...prices) : 15000;
  }, [allPackages]);

  const allTypes = useMemo(() => {
    const fromPackages = allPackages.map((p) => p.type).filter(Boolean);
    const fromDynamic = dynamicTourTypes.map((t) => t.name);
    return Array.from(new Set([...fromPackages, ...fromDynamic])).sort();
  }, [allPackages, dynamicTourTypes]);

  const allDestinationOptions = useMemo(() =>
    Array.from(new Set(allPackages.flatMap((p) => p.destinations).filter(Boolean))).sort()
    , [allPackages]);

  const durationOptions = useMemo(() => {
    const vals = allPackages.map((p) => parseInt(p.duration)).filter((n) => !isNaN(n));
    if (!vals.length) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const opts: string[] = ["All"];
    if (min < 7) opts.push("Under 7 Days");
    if (max >= 7) opts.push("7-10 Days");
    if (max >= 10) opts.push("10-14 Days");
    if (max >= 15) opts.push("15+ Days");
    return opts;
  }, [allPackages]);

  const filteredPackages = useMemo(() => {
    return allPackages.filter((pkg) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(pkg.type)) return false;

      if (selectedDestinations.length > 0 && !selectedDestinations.some((d) => pkg.destinations.includes(d))) return false;

      if (
        searchQuery &&
        !pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pkg.destinations.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) return false;

      const priceVal = parseInt(pkg.price.replace(/[^0-9]/g, ""));
      if (!isNaN(priceVal) && priceVal > maxPrice) return false;

      if (durationFilter !== "All") {
        const d = parseInt(pkg.duration);
        if (!isNaN(d)) {
          if (durationFilter === "Under 7 Days" && d >= 7) return false;
          if (durationFilter === "7-10 Days" && (d < 7 || d > 10)) return false;
          if (durationFilter === "10-14 Days" && (d < 10 || d > 14)) return false;
          if (durationFilter === "15+ Days" && d < 15) return false;
        }
      }

      return true;
    });
  }, [allPackages, selectedTypes, selectedDestinations, searchQuery, maxPrice, durationFilter]);

  const totalPages = Math.max(Math.ceil(filteredPackages.length / PAGE_SIZE), 1);
  const paginatedPackages = filteredPackages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount = selectedTypes.length + selectedDestinations.length +
    (durationFilter !== "All" ? 1 : 0) +
    (maxPrice < priceMax ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const clearFilters = () => {
    setMaxPrice(priceMax);
    setDurationFilter("All");
    setSelectedTypes([]);
    setSelectedDestinations([]);
    setSearchQuery("");
  };

  const toggleType = (type: string) =>
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);

  const toggleDestination = (dest: string) =>
    setSelectedDestinations((prev) => prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest]);

  const FilterPanel = (
    <div>
      {/* search */}
      <div className="px-6 py-4 border-b border-white/8">
        <div className="flex items-center gap-2 bg-white/8 border border-white/15 px-3 py-2.5 focus-within:border-lux-accent transition-colors">
          <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages..."
            className="text-sm bg-transparent outline-none text-white placeholder:text-white/30 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}><X className="w-3 h-3 text-white/40 hover:text-white transition-colors" /></button>
          )}
        </div>
      </div>

      {/* tour type */}
      {allTypes.length > 0 && (
        <FilterSection title="Tour Type">
          <div className="space-y-1">
            {allTypes.map((type) => {
              const count = allPackages.filter((p) => p.type === type).length;
              const active = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${active ? "bg-lux-accent/20 border-l-2 border-lux-accent" : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${active ? "bg-lux-accent border-lux-accent" : "border-white/30 group-hover:border-white/60"
                      }`}>
                      {active && <div className="w-1.5 h-1.5 bg-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${active ? "text-white font-medium" : "text-white/65 group-hover:text-white"}`}>{type}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 transition-colors ${active ? "bg-lux-accent text-white" : "bg-white/10 text-white/40"
                    }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* destinations */}
      {allDestinationOptions.length > 0 && (
        <FilterSection title="Destinations" defaultOpen={false}>
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {allDestinationOptions.map((dest) => {
              const count = allPackages.filter((p) => p.destinations.includes(dest)).length;
              const active = selectedDestinations.includes(dest);
              return (
                <button
                  key={dest}
                  onClick={() => toggleDestination(dest)}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${active ? "bg-lux-accent/20 border-l-2 border-lux-accent" : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${active ? "bg-lux-accent border-lux-accent" : "border-white/30 group-hover:border-white/60"
                      }`}>
                      {active && <div className="w-1.5 h-1.5 bg-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${active ? "text-white font-medium" : "text-white/65 group-hover:text-white"}`}>{dest}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 transition-colors ${active ? "bg-lux-accent text-white" : "bg-white/10 text-white/40"
                    }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* price */}
      <FilterSection title="Budget Range">
        <div className="space-y-4">
          <div className="text-center">
            <span className="font-headings text-2xl text-white">PKR {maxPrice.toLocaleString()}</span>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Maximum Price</p>
          </div>
          <input
            type="range"
            min={0}
            max={priceMax}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full accent-lux-accent cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/35 uppercase tracking-widest">
            <span>PKR 0</span>
            <span>PKR {priceMax.toLocaleString()}+</span>
          </div>
        </div>
      </FilterSection>

      {/* duration */}
      {durationOptions.length > 1 && (
        <FilterSection title="Duration">
          <div className="space-y-1">
            {durationOptions.map((dur) => {
              const count = dur === "All" ? allPackages.length : allPackages.filter((p) => {
                const d = parseInt(p.duration);
                if (isNaN(d)) return false;
                if (dur === "Under 7 Days") return d < 7;
                if (dur === "7-10 Days") return d >= 7 && d <= 10;
                if (dur === "10-14 Days") return d >= 10 && d <= 14;
                if (dur === "15+ Days") return d >= 15;
                return false;
              }).length;
              const active = durationFilter === dur;
              return (
                <button
                  key={dur}
                  onClick={() => setDurationFilter(dur)}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${active ? "bg-lux-accent/20 border-l-2 border-lux-accent" : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${active ? "border-lux-accent" : "border-white/30 group-hover:border-white/60"
                      }`}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-lux-accent" />}
                    </div>
                    <span className={`text-sm transition-colors ${active ? "text-white font-medium" : "text-white/65 group-hover:text-white"}`}>{dur}</span>
                  </div>
                  {dur !== "All" && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 transition-colors ${active ? "bg-lux-accent text-white" : "bg-white/10 text-white/40"
                      }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* clear */}
      {activeFilterCount > 0 && (
        <div className="px-6 py-4">
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center gap-2 border border-white/20 text-white/60 hover:text-white hover:border-white/50 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-all cursor-pointer"
          >
            <X className="w-3 h-3" /> Clear All ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO 
        title="Luxury & Adventure Tour Packages | Northern Pakistan Trips"
        description="Browse our curated selection of tour packages for Northern Pakistan. Adventure tours, cultural journeys, honeymoon packages, and family trips available."
        keywords="adventure tours Pakistan, honeymoon packages Hunza, family tour packages Skardu, cultural tours Gilgit, Pakistan trekking packages, group tours Northern Pakistan, corporate retreats Gilgit, school trips Northern Areas"
      />
      <Navbar />


      {/* Hero */}
      <section className="relative pt-32 pb-12 bg-lux-bg text-lux-primary px-6 sm:px-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="text-lux-accent text-xs uppercase tracking-[0.4em] font-bold mb-4">Signature Expeditions</div>
              <h1 className="font-headings text-4xl sm:text-6xl lg:text-7xl mb-6 leading-[1.1]">
                Unveil the <br />
                <span className="text-lux-accent italic font-light font-body">Extraordinary</span>
              </h1>
            </div>
            <div className="lg:pb-4">
              <p className="text-base opacity-70 max-w-xl font-light leading-relaxed mb-6">
                From the jagged peaks of the Karakoram to the serene valleys of Hunza, our curated tour packages are designed for those who seek more than just a trip—they seek a legacy. Discover itineraries that blend raw adventure with unparalleled luxury.
              </p>
              <div className="w-20 h-px bg-lux-accent" />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full pt-16 pb-12 flex-1 flex flex-col lg:flex-row gap-0 border-t border-border/50">

        {/* mobile filter toggle */}
        <div className="lg:hidden flex items-center justify-between mb-2 px-6 sm:px-12">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 border border-border rounded-sm px-4 py-2 text-sm font-medium text-lux-primary hover:bg-white transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilterCount > 0 && <span className="bg-lux-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{activeFilterCount}</span>}
          </button>
        </div>

        {/* mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-50 w-80 bg-lux-primary h-full overflow-y-auto shadow-xl ml-auto">
              <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-lux-accent mb-1">Refine Results</p>
                  <h3 className="font-headings text-2xl text-white">Filters</h3>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              {FilterPanel}
            </div>
          </div>
        )}

        {/* desktop sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="bg-lux-primary sticky top-0 min-h-screen overflow-y-auto">
            {/* header */}
            <div className="px-6 py-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-lux-accent mb-1">Refine Results</p>
                  <h3 className="font-headings text-2xl text-white">Filters</h3>
                </div>
                {activeFilterCount > 0 && (
                  <div className="flex flex-col items-center justify-center w-9 h-9 bg-lux-accent">
                    <span className="text-white text-sm font-bold">{activeFilterCount}</span>
                  </div>
                )}
              </div>
            </div>
            {FilterPanel}
          </div>
        </aside>

        {/* main content */}
        <div className="flex-1 min-w-0 px-6 sm:px-10 py-0">
          {!isLoading && !error && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                  {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""} found
                </p>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-[10px] uppercase tracking-widest text-lux-accent hover:text-lux-primary transition-colors font-bold">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
                <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
                <span className="text-sm">Loading tour packages...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">Unable to Load Tour Packages</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-lux-primary text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
                Try Again
              </button>
            </div>
          ) : paginatedPackages.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">No Packages Found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
              <button onClick={clearFilters} className="bg-lux-primary text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedPackages.map((pkg, i) => (
                <Link
                  to={`/tour-packages/${pkg.id}`}
                  key={pkg.id}
                  className="group cursor-pointer bg-white overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-500 animate-in fade-in zoom-in-95 duration-300"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className="relative h-60 bg-cover bg-center overflow-hidden"
                    style={{ backgroundImage: `url('${pkg.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200"}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 bg-cover bg-center"
                      style={{ backgroundImage: `url('${pkg.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200"}')`, zIndex: -1 }}
                    />
                    {pkg.type && (
                      <div className="absolute top-4 left-4 bg-lux-primary text-white text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 font-bold">
                        {pkg.type}
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white text-lux-primary px-3 py-1.5">
                      <p className="text-[9px] uppercase tracking-widest text-lux-primary/50 leading-none mb-0.5">From</p>
                      <p className="text-sm font-bold leading-none">{pkg.price}</p>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col border-b border-l border-r border-border">
                    <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors duration-300">{pkg.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1 line-clamp-3">{pkg.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/60">
                      <div className="flex items-center gap-1 text-xs text-lux-primary/60">
                        <Clock className="w-3.5 h-3.5 text-lux-accent" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-lux-primary/60">
                        <Map className="w-3.5 h-3.5 text-lux-accent" />
                        <span>{pkg.destinations.length} Destination{pkg.destinations.length !== 1 ? "s" : ""}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-lux-accent font-bold group-hover:underline">View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="flex justify-center mt-16">
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center border border-border rounded-sm hover:bg-lux-primary hover:text-white transition-colors text-muted-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 flex items-center justify-center border rounded-sm transition-colors cursor-pointer ${currentPage === page ? "border-lux-primary bg-lux-primary text-white" : "border-border hover:bg-lux-primary hover:text-white"}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center border border-border rounded-sm hover:bg-lux-primary hover:text-white transition-colors text-muted-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
