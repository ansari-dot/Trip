import { Search, MapPin, ChevronLeft, ChevronRight, X, LoaderCircle, SlidersHorizontal, ChevronDown, CloudSun, Wind } from "lucide-react";
import { getApiUrl, parseJsonSafely, API_BASE } from "../lib/api";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

type Destination = {
  _id?: string;
  id: string;
  name: string;
  location: string;
  tours?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  highlights?: string[];
  price?: string;
  duration?: string;
  expertTip?: string;
  cuisine?: string;
  whenToGo?: string;
  latitude?: number;
  longitude?: number;
};

function normalizeDestination(input: unknown): Destination | null {
  if (!input || typeof input !== "object") return null;
  const destination = input as Destination;
  if (!destination.id || !destination.name || !destination.location) return null;
  return {
    _id: destination._id,
    id: destination.id,
    name: destination.name,
    location: destination.location,
    tours: destination.tours || "",
    description: destination.description || "",
    image: destination.image || "",
    gallery: Array.isArray(destination.gallery) ? destination.gallery : [],
    highlights: Array.isArray(destination.highlights) ? destination.highlights : [],
    price: destination.price || "",
    duration: destination.duration || "",
    expertTip: destination.expertTip || "",
    cuisine: destination.cuisine || "",
    whenToGo: destination.whenToGo || "",
    latitude: destination.latitude,
    longitude: destination.longitude,
  };
}

const PAGE_SIZE = 6;

// Weather Box Component for destination cards
function WeatherBox({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  const [weather, setWeather] = useState<{ 
    current: { temperature: number; humidity: number; windSpeed: number; weatherCode: number };
    daily: { tempMax: number[]; tempMin: number[] };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Weather code to emoji mapping
  const getWeatherEmoji = (code: number) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 49) return '🌫️';
    if (code <= 59) return '🌧️';
    if (code <= 69) return '❄️';
    if (code <= 79) return '🌧️';
    if (code <= 99) return '⛈️';
    return '🌤️';
  };

  useEffect(() => {
    if (!latitude || !longitude) return;
    setLoading(true);
    fetch(getApiUrl(`/api/weather?latitude=${latitude}&longitude=${longitude}`))
      .then(res => res.json())
      .then(data => { if (data?.success) setWeather(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [latitude, longitude]);

  if (!latitude || !longitude) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600/95 via-cyan-500/95 to-teal-400/95 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-2xl text-white min-w-[150px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{weather ? getWeatherEmoji(weather.current.weatherCode) : '🌤️'}</span>
        <span className="text-[10px] uppercase tracking-wider font-bold text-white/80">Current</span>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : weather ? (
        <div className="space-y-2">
          <div className="text-3xl font-bold">{Math.round(weather.current.temperature)}°C</div>
          <div className="flex items-center gap-3 text-xs text-white/90">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3" />{Math.round(weather.current.windSpeed)} km/h
            </span>
            <span>💧{Math.round(weather.current.humidity)}%</span>
          </div>
          {weather.daily?.tempMax?.[0] && weather.daily?.tempMin?.[0] && (
            <div className="text-xs text-white/70 pt-1 border-t border-white/20">
              H: {Math.round(weather.daily.tempMax[0])}° L: {Math.round(weather.daily.tempMin[0])}°
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left py-4 px-6 border-b border-white/8 hover:bg-white/5 transition-colors"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-lux-accent">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 py-4 border-b border-white/8">{children}</div>}
    </div>
  );
}

export default function Destinations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [tourCountFilter, setTourCountFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setError("");
      try {
        const first = await fetch(getApiUrl("/api/destinations?page=1"));
        const firstData = await parseJsonSafely(first);
        if (!first.ok) { setError(firstData?.message || "Failed to load destinations."); setAllDestinations([]); return; }
        const totalPages: number = Math.max(Number(firstData?.totalPages) || 1, 1);
        const collected: Destination[] = (Array.isArray(firstData?.data) ? firstData.data.map(normalizeDestination).filter(Boolean) : []) as Destination[];
        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(getApiUrl(`/api/destinations?page=${i + 2}`)).then(parseJsonSafely)
            )
          );
          rest.forEach((data) => {
            if (Array.isArray(data?.data)) {
              (data.data.map(normalizeDestination).filter(Boolean) as Destination[]).forEach((d) => collected.push(d));
            }
          });
        }
        setAllDestinations(collected);
      } catch {
        setError("Unable to load destinations from the server.");
        setAllDestinations([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadAll();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedLocations, tourCountFilter]);

  const allLocations = useMemo(() =>
    Array.from(new Set(allDestinations.map((d) => d.location.trim()).filter(Boolean))).sort()
    , [allDestinations]);

  const filteredDestinations = useMemo(() => {
    return allDestinations.filter((dest) => {
      if (selectedLocations.length > 0 && !selectedLocations.includes(dest.location.trim())) return false;

      if (
        searchQuery &&
        !dest.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !dest.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(dest.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      ) return false;

      if (tourCountFilter !== "All") {
        const toursVal = parseInt(dest.tours || "0", 10);
        if (tourCountFilter === "1-5 Tours" && (toursVal < 1 || toursVal > 5)) return false;
        if (tourCountFilter === "6-10 Tours" && (toursVal < 6 || toursVal > 10)) return false;
        if (tourCountFilter === "11+ Tours" && toursVal < 11) return false;
      }

      return true;
    });
  }, [allDestinations, selectedLocations, searchQuery, tourCountFilter]);

  const totalPages = Math.max(Math.ceil(filteredDestinations.length / PAGE_SIZE), 1);
  const paginatedDestinations = filteredDestinations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount = selectedLocations.length + (tourCountFilter !== "All" ? 1 : 0) + (searchQuery ? 1 : 0);

  const clearFilters = () => {
    setSelectedLocations([]);
    setTourCountFilter("All");
    setSearchQuery("");
  };

  const toggleLocation = (loc: string) =>
    setSelectedLocations((prev) => prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]);

  const tourCountOptions = ["All", "1-5 Tours", "6-10 Tours", "11+ Tours"];

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
            placeholder="Search destinations..."
            className="text-sm bg-transparent outline-none text-white placeholder:text-white/30 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}><X className="w-3 h-3 text-white/40 hover:text-white transition-colors" /></button>
          )}
        </div>
      </div>

      {/* location */}
      {allLocations.length > 0 && (
        <FilterSection title="Location">
          <div className="space-y-1">
            {allLocations.map((loc) => {
              const count = allDestinations.filter((d) => d.location.trim() === loc).length;
              const active = selectedLocations.includes(loc);
              return (
                <button
                  key={loc}
                  onClick={() => toggleLocation(loc)}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${active ? "bg-lux-accent/20 border-l-2 border-lux-accent" : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${active ? "bg-lux-accent border-lux-accent" : "border-white/30 group-hover:border-white/60"
                      }`}>
                      {active && <div className="w-1.5 h-1.5 bg-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${active ? "text-white font-medium" : "text-white/65 group-hover:text-white"}`}>{loc}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 transition-colors ${active ? "bg-lux-accent text-white" : "bg-white/10 text-white/40"
                    }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* tour count */}
      <FilterSection title="Available Tours">
        <div className="space-y-1">
          {tourCountOptions.map((opt) => {
            const active = tourCountFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => setTourCountFilter(opt)}
                className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${active ? "bg-lux-accent/20 border-l-2 border-lux-accent" : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${active ? "border-lux-accent" : "border-white/30 group-hover:border-white/60"
                    }`}>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-lux-accent" />}
                  </div>
                  <span className={`text-sm transition-colors ${active ? "text-white font-medium" : "text-white/65 group-hover:text-white"}`}>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
      </FilterSection>

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
        title="Top Destinations in Northern Pakistan | Hunza, Skardu, Gilgit"
        description="Discover the most beautiful destinations in Northern Pakistan. From the majestic Hunza Valley to the serene lakes of Skardu and the rugged beauty of Gilgit."
        keywords="Hunza Valley, Skardu, Gilgit, Fairy Meadows, Deosai Plains, Naran Kaghan, Swat Valley, Northern Pakistan destinations"
      />
      <Navbar />


      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-10 sm:pb-12 bg-lux-bg text-lux-primary px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="text-lux-accent text-xs uppercase tracking-[0.4em] font-bold mb-4">World Collection</div>
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-[1.1]">
                Iconic <br />
                <span className="text-lux-accent italic font-light font-body">Escapes</span>
              </h1>
            </div>
            <div className="lg:pb-4">
              <p className="text-base opacity-70 max-w-xl font-light leading-relaxed mb-6">
                From the glacial valleys of Skardu to the legendary peaks of Gilgit, explore our curated selection of Northern Pakistan's most awe-inspiring destinations. Each location is a masterpiece of nature, waiting to be discovered.
              </p>
              <div className="w-20 h-px bg-lux-accent" />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full pt-8 sm:pt-16 pb-12 flex-1 flex flex-col lg:flex-row gap-0 border-t border-border/50">

        {/* mobile filter toggle */}
        <div className="lg:hidden flex items-center justify-between mb-3 px-4 sm:px-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? "s" : ""}
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
          <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-end">
            <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setSidebarOpen(false)} aria-label="Close filters" />
            <div className="relative z-50 bg-lux-primary rounded-t-[1.75rem] max-h-[min(88dvh,40rem)] flex flex-col shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-300 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="shrink-0 pt-3 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-white/25" aria-hidden />
              </div>
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-lux-accent mb-1">Refine Results</p>
                  <h3 className="font-headings text-xl text-white">Filters</h3>
                </div>
                <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 -mr-1 text-white/50 hover:text-white transition-colors touch-manipulation" aria-label="Close">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">
                {FilterPanel}
              </div>
            </div>
          </div>
        )}

        {/* desktop sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="bg-lux-primary sticky top-0 min-h-screen overflow-y-auto">
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
        <div className="flex-1 min-w-0 px-4 sm:px-8 lg:px-10 py-0">
          {!isLoading && !error && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? "s" : ""} found
              </p>
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
                <span className="text-sm">Loading destinations...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">Unable to Load Destinations</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-lux-primary text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
                Try Again
              </button>
            </div>
          ) : paginatedDestinations.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">No Destinations Found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
              <button onClick={clearFilters} className="bg-lux-primary text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDestinations.map((dest, i) => (
                <Link
                  to={`/destinations/${dest.id}`}
                  key={dest.id}
                  className="group cursor-pointer relative overflow-hidden h-72 sm:h-80 block animate-in fade-in zoom-in-95 duration-300 rounded-2xl sm:rounded-none ring-1 ring-black/5 sm:ring-0"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${dest.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200"}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  {/* Weather Box */}
                  <div className="absolute top-4 left-4 z-10">
                    <WeatherBox latitude={dest.latitude} longitude={dest.longitude} />
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-lux-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex justify-between items-end gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-lux-accent font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Explore
                        </p>
                        <h3 className="font-headings text-3xl mb-1 leading-tight">{dest.name}</h3>
                        <p className="text-sm opacity-70 flex items-center gap-1">
                          <MapPin className="text-lux-accent w-3.5 h-3.5 shrink-0" />
                          {dest.location}
                        </p>
                      </div>
                      {dest.tours && (
                        <div className="text-xs font-bold bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 shrink-0">
                          {dest.tours}
                        </div>
                      )}
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
