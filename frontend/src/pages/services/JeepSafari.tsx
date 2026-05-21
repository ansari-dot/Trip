import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  LoaderCircle,
  SlidersHorizontal,
  ChevronDown,
  Compass,
  Clock,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getApiUrl, parseJsonSafely } from "../../lib/api";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

type JeepSafari = {
  _id?: string;
  id: string;
  name: string;
  region?: string;
  duration?: string;
  pricePerPerson?: string;
  pricePerJeep?: string;
  image?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  vehicleType?: string;
  maxGroupSize?: string;
  bestSeason?: string;
  highlights?: string[];
  featured?: boolean;
  displayOrder?: number;
};

function normalizeSafari(input: unknown): JeepSafari | null {
  if (!input || typeof input !== "object") return null;
  const s = input as JeepSafari;
  if (!s.id || !s.name) return null;
  return {
    _id: s._id,
    id: s.id,
    name: s.name,
    region: s.region || "",
    duration: s.duration || "",
    pricePerPerson: s.pricePerPerson || "",
    pricePerJeep: s.pricePerJeep || "",
    image: s.image || "",
    description: s.description || "",
    category: s.category || "",
    difficulty: s.difficulty || "",
    vehicleType: s.vehicleType || "",
    maxGroupSize: s.maxGroupSize || "",
    bestSeason: s.bestSeason || "",
    highlights: Array.isArray(s.highlights) ? s.highlights : [],
    featured: Boolean(s.featured),
    displayOrder: Number.isFinite(Number(s.displayOrder)) ? Number(s.displayOrder) : 0,
  };
}

const PAGE_SIZE = 9;
const DIFFICULTY_OPTIONS = ["All", "Easy", "Moderate", "Challenging"] as const;
type DifficultyFilter = (typeof DIFFICULTY_OPTIONS)[number];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left py-4 px-6 group border-b border-white/8 hover:bg-white/5 transition-colors"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-lux-accent">
          {title}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="px-6 py-4 border-b border-white/8">{children}</div>}
    </div>
  );
}

const parsePrice = (value: string) => {
  if (!value) return NaN;
  const num = parseInt(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(num) ? num : NaN;
};

const safariMinPrice = (safari: JeepSafari) => {
  const candidates: number[] = [];
  const a = parsePrice(safari.pricePerPerson || "");
  const b = parsePrice(safari.pricePerJeep || "");
  if (!isNaN(a)) candidates.push(a);
  if (!isNaN(b)) candidates.push(b);
  if (candidates.length === 0) return NaN;
  return Math.min(...candidates);
};

export default function JeepSafariPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [maxPrice, setMaxPrice] = useState<number>(999999);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [safaris, setSafaris] = useState<JeepSafari[]>([]);
  const [safariCategories, setSafariCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadSafaris = async () => {
      setIsLoading(true);
      setError("");
      try {
        const first = await fetch(getApiUrl(`/api/jeep-safaris?page=1&limit=${PAGE_SIZE}`));
        const firstData = await parseJsonSafely(first);
        if (!first.ok) {
          setError(firstData?.message || "Failed to load jeep safaris.");
          setSafaris([]);
          return;
        }
        const totalPages: number = Math.max(Number(firstData?.totalPages) || 1, 1);
        const collected: JeepSafari[] = (Array.isArray(firstData?.data)
          ? firstData.data.map(normalizeSafari).filter(Boolean)
          : []) as JeepSafari[];
        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(getApiUrl(`/api/jeep-safaris?page=${i + 2}&limit=${PAGE_SIZE}`)).then(
                parseJsonSafely
              )
            )
          );
          rest.forEach((data) => {
            if (Array.isArray(data?.data)) {
              (data.data.map(normalizeSafari).filter(Boolean) as JeepSafari[]).forEach((s) =>
                collected.push(s)
              );
            }
          });
        }
        setSafaris(collected);
      } catch {
        setError("Unable to load jeep safaris from the server.");
        setSafaris([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadSafaris();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(getApiUrl("/api/jeep-safari-categories"));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setSafariCategories(data.data);
        }
      } catch {
        /* silent fallback */
      }
    };
    void loadCategories();
  }, []);

  const priceMax = useMemo(() => {
    const prices = safaris.map(safariMinPrice).filter((n) => !isNaN(n));
    return prices.length > 0 ? Math.max(...prices) : 100000;
  }, [safaris]);

  useEffect(() => {
    if (safaris.length > 0 && !priceInitialized) {
      setMaxPrice(priceMax);
      setPriceInitialized(true);
    }
  }, [safaris, priceMax, priceInitialized]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedRegions, difficulty, maxPrice, featuredOnly]);

  const allCategories = useMemo(() => {
    const fromBackend = safariCategories.map((c) => c.name);
    const fromData = safaris.map((s) => s.category).filter(Boolean) as string[];
    return Array.from(new Set([...fromBackend, ...fromData])).sort();
  }, [safaris, safariCategories]);

  const allRegions = useMemo(
    () => Array.from(new Set(safaris.map((s) => s.region).filter(Boolean) as string[])).sort(),
    [safaris]
  );

  const filteredSafaris = useMemo(() => {
    return safaris.filter((s) => {
      if (featuredOnly && !s.featured) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(s.category || ""))
        return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(s.region || "")) return false;
      if (difficulty !== "All" && (s.difficulty || "").toLowerCase() !== difficulty.toLowerCase())
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hay =
          `${s.name} ${s.region || ""} ${s.category || ""} ${s.description || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const minP = safariMinPrice(s);
      if (!isNaN(minP) && minP > maxPrice) return false;
      return true;
    });
  }, [safaris, selectedCategories, selectedRegions, difficulty, searchQuery, maxPrice, featuredOnly]);

  const totalPages = Math.max(Math.ceil(filteredSafaris.length / PAGE_SIZE), 1);
  const paginated = filteredSafaris.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterCount =
    selectedCategories.length +
    selectedRegions.length +
    (difficulty !== "All" ? 1 : 0) +
    (priceInitialized && maxPrice < priceMax ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (featuredOnly ? 1 : 0);

  const clearFilters = () => {
    setMaxPrice(priceMax);
    setDifficulty("All");
    setSelectedCategories([]);
    setSelectedRegions([]);
    setSearchQuery("");
    setFeaturedOnly(false);
  };

  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  const toggleRegion = (r: string) =>
    setSelectedRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const FilterPanel = (
    <div>
      <div className="px-6 py-4 border-b border-white/8">
        <div className="flex items-center gap-2 bg-white/8 border border-white/15 px-3 py-2.5 focus-within:border-lux-accent transition-colors">
          <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search safaris..."
            className="text-sm bg-transparent outline-none text-white placeholder:text-white/30 w-full"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")}>
              <X className="w-3 h-3 text-white/40 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      {allCategories.length > 0 && (
        <FilterSection title="Safari Category">
          <div className="space-y-1">
            {allCategories.map((cat) => {
              const count = safaris.filter((s) => s.category === cat).length;
              const active = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${
                    active
                      ? "bg-lux-accent/20 border-l-2 border-lux-accent"
                      : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${
                        active
                          ? "bg-lux-accent border-lux-accent"
                          : "border-white/30 group-hover:border-white/60"
                      }`}
                    >
                      {active && <div className="w-1.5 h-1.5 bg-white" />}
                    </div>
                    <span
                      className={`text-sm transition-colors ${
                        active ? "text-white font-medium" : "text-white/65 group-hover:text-white"
                      }`}
                    >
                      {cat}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 transition-colors ${
                      active ? "bg-lux-accent text-white" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {allRegions.length > 0 && (
        <FilterSection title="Region" defaultOpen={false}>
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {allRegions.map((r) => {
              const count = safaris.filter((s) => s.region === r).length;
              const active = selectedRegions.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRegion(r)}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${
                    active
                      ? "bg-lux-accent/20 border-l-2 border-lux-accent"
                      : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${
                        active
                          ? "bg-lux-accent border-lux-accent"
                          : "border-white/30 group-hover:border-white/60"
                      }`}
                    >
                      {active && <div className="w-1.5 h-1.5 bg-white" />}
                    </div>
                    <span
                      className={`text-sm transition-colors ${
                        active ? "text-white font-medium" : "text-white/65 group-hover:text-white"
                      }`}
                    >
                      {r}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 transition-colors ${
                      active ? "bg-lux-accent text-white" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Difficulty" defaultOpen={false}>
        <div className="space-y-1">
          {DIFFICULTY_OPTIONS.map((bucket) => {
            const active = difficulty === bucket;
            const count =
              bucket === "All"
                ? safaris.length
                : safaris.filter((s) => (s.difficulty || "").toLowerCase() === bucket.toLowerCase())
                    .length;
            return (
              <button
                key={bucket}
                type="button"
                onClick={() => setDifficulty(bucket)}
                className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${
                  active
                    ? "bg-lux-accent/20 border-l-2 border-lux-accent"
                    : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      active ? "border-lux-accent" : "border-white/30 group-hover:border-white/60"
                    }`}
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-lux-accent" />}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      active ? "text-white font-medium" : "text-white/65 group-hover:text-white"
                    }`}
                  >
                    {bucket}
                  </span>
                </div>
                {bucket !== "All" && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 transition-colors ${
                      active ? "bg-lux-accent text-white" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Budget" defaultOpen={false}>
        <div className="space-y-4">
          <div className="text-center">
            <span className="font-headings text-2xl text-white">
              PKR {maxPrice.toLocaleString()}
            </span>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
              Maximum Price
            </p>
          </div>
          <input
            type="range"
            min={0}
            max={priceMax}
            step={500}
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

      {safaris.some((s) => s.featured) && (
        <FilterSection title="Special Selection" defaultOpen={false}>
          <button
            type="button"
            onClick={() => setFeaturedOnly((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${
              featuredOnly
                ? "bg-lux-accent/20 border-l-2 border-lux-accent"
                : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${
                  featuredOnly
                    ? "bg-lux-accent border-lux-accent"
                    : "border-white/30 group-hover:border-white/60"
                }`}
              >
                {featuredOnly && <div className="w-1.5 h-1.5 bg-white" />}
              </div>
              <span
                className={`text-sm transition-colors ${
                  featuredOnly ? "text-white font-medium" : "text-white/65 group-hover:text-white"
                }`}
              >
                Featured safaris only
              </span>
            </div>
          </button>
        </FilterSection>
      )}

      {activeFilterCount > 0 && (
        <div className="px-6 py-4">
          <button
            type="button"
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
        title="Jeep Safaris in Northern Pakistan | Deosai, Shimshal, Khunjerab"
        description="Browse curated jeep safari trips across Skardu, Hunza, Deosai, and beyond. Compare regions, difficulty, duration, and prices — all managed live from our admin."
        keywords="jeep safari Pakistan, Deosai safari, Shimshal jeep tour, Hunza off-road, Khunjerab safari"
      />
      <Navbar />

      <section className="relative pt-28 sm:pt-32 pb-10 sm:pb-12 bg-lux-bg text-lux-primary px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="text-lux-accent text-xs uppercase tracking-[0.4em] font-bold mb-4">
                Off-Road Expeditions
              </div>
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-[1.1]">
                Conquer the <br />
                <span className="text-lux-accent italic font-light font-body">Wild</span>
              </h1>
            </div>
            <div className="lg:pb-4">
              <p className="text-base opacity-70 max-w-xl font-light leading-relaxed mb-6">
                Hand-driven jeep safaris across the world's highest mountain passes, alpine plains,
                and ancient valleys. Every trip is led by experienced drivers and curated by our team.
              </p>
              <div className="w-20 h-px bg-lux-accent" />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full pt-8 sm:pt-16 pb-12 flex-1 flex flex-col lg:flex-row gap-0 border-t border-border/50">
        <div className="lg:hidden flex items-center justify-between mb-3 px-4 sm:px-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {filteredSafaris.length} safari{filteredSafaris.length !== 1 ? "s" : ""}
          </p>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 border border-border rounded-sm px-4 py-2 text-sm font-medium text-lux-primary hover:bg-white transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters{" "}
            {activeFilterCount > 0 && (
              <span className="bg-lux-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-end">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close filters"
            />
            <div className="relative z-50 bg-lux-primary rounded-t-[1.75rem] max-h-[min(88dvh,40rem)] flex flex-col shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-300 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="shrink-0 pt-3 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-white/25" aria-hidden />
              </div>
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-lux-accent mb-1">
                    Refine Results
                  </p>
                  <h3 className="font-headings text-xl text-white">Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 -mr-1 text-white/50 hover:text-white transition-colors touch-manipulation"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">{FilterPanel}</div>
            </div>
          </div>
        )}

        <aside className="hidden lg:block w-80 shrink-0">
          <div className="bg-lux-primary sticky top-0 min-h-screen overflow-y-auto">
            <div className="px-6 py-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-lux-accent mb-1">
                    Refine Results
                  </p>
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

        <div className="flex-1 min-w-0 px-4 sm:px-8 lg:px-10 py-0">
          {!isLoading && !error && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                  {filteredSafaris.length} safari{filteredSafaris.length !== 1 ? "s" : ""} found
                </p>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] uppercase tracking-widest text-lux-accent hover:text-lux-primary transition-colors font-bold"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
                <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
                <span className="text-sm">Loading jeep safaris...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">Unable to Load Safaris</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-lux-primary text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">No Safaris Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or come back soon — new expeditions are added regularly.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-lux-primary text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {paginated.map((safari, i) => {
                const priceLabel = safari.pricePerPerson || safari.pricePerJeep || "";
                return (
                  <Link
                    to={`/jeep-safaris/${safari.id}`}
                    key={safari.id}
                    className="group cursor-pointer bg-white overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-500 animate-in fade-in zoom-in-95 rounded-2xl sm:rounded-none border border-border/60 sm:border-0 shadow-sm sm:shadow-none"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div
                      className="relative h-48 bg-cover bg-center overflow-hidden"
                      style={{
                        backgroundImage: `url('${
                          safari.image ||
                          "https://images.unsplash.com/photo-1597178454113-be25b884b8a4?auto=format&fit=crop&q=80&w=1200"
                        }')`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
                      {safari.category && (
                        <div className="absolute top-3 left-3 bg-lux-primary text-white text-[9px] uppercase tracking-[0.18em] px-2.5 py-1 font-bold">
                          {safari.category}
                        </div>
                      )}
                      {safari.difficulty ? (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-lux-primary">
                          {safari.difficulty}
                        </div>
                      ) : null}
                      {priceLabel ? (
                        <div className="absolute bottom-3 right-3 bg-white text-lux-primary px-2.5 py-1">
                          <p className="text-[8px] uppercase tracking-widest text-lux-primary/50 leading-none mb-0.5">
                            From
                          </p>
                          <p className="text-xs font-bold leading-none">{priceLabel}</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col border-b border-l border-r border-border">
                      <h3 className="font-headings text-lg leading-snug mb-1 group-hover:text-lux-accent transition-colors duration-300 line-clamp-1">
                        {safari.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-lux-primary/60 mb-2.5">
                        <MapPin className="w-3 h-3 text-lux-accent shrink-0" />
                        <span className="truncate">{safari.region || "—"}</span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
                        {safari.description ||
                          "Spectacular jeep safari through Northern Pakistan's untouched landscapes."}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
                        <div className="flex items-center gap-1 text-[11px] text-lux-primary/60 min-w-0">
                          <Clock className="w-3 h-3 text-lux-accent shrink-0" />
                          <span className="truncate">{safari.duration || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-lux-primary/60 min-w-0">
                          <Compass className="w-3 h-3 text-lux-accent shrink-0" />
                          <span className="truncate">{safari.vehicleType || "Jeep"}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.18em] text-lux-accent font-bold group-hover:underline shrink-0">
                          View →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="flex justify-center mt-16">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-sm hover:bg-lux-primary hover:text-white transition-colors text-muted-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center border rounded-sm transition-colors cursor-pointer ${
                      currentPage === page
                        ? "border-lux-primary bg-lux-primary text-white"
                        : "border-border hover:bg-lux-primary hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-sm hover:bg-lux-primary hover:text-white transition-colors text-muted-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
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
