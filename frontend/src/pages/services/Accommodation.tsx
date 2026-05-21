import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  LoaderCircle,
  SlidersHorizontal,
  ChevronDown,
  Star,
  BedDouble,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getApiUrl, parseJsonSafely } from "../../lib/api";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

type HotelRoom = {
  name: string;
  price?: string;
};

type Hotel = {
  _id?: string;
  id: string;
  name: string;
  location: string;
  category?: string;
  rating?: number;
  description?: string;
  image?: string;
  priceFrom?: string;
  amenities?: string[];
  rooms?: HotelRoom[];
  featured?: boolean;
  displayOrder?: number;
};

function normalizeHotel(input: unknown): Hotel | null {
  if (!input || typeof input !== "object") return null;
  const hotel = input as Hotel;
  if (!hotel.id || !hotel.name || !hotel.location) return null;
  return {
    _id: hotel._id,
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    category: hotel.category || "",
    rating: Number.isFinite(Number(hotel.rating)) ? Number(hotel.rating) : 0,
    description: hotel.description || "",
    image: hotel.image || "",
    priceFrom: hotel.priceFrom || "",
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
    rooms: Array.isArray(hotel.rooms) ? hotel.rooms : [],
    featured: Boolean(hotel.featured),
    displayOrder: Number.isFinite(Number(hotel.displayOrder))
      ? Number(hotel.displayOrder)
      : 0,
  };
}

const PAGE_SIZE = 9;
const RATING_BUCKETS = ["All", "4.5+", "4+", "3.5+", "3+"] as const;
type RatingBucket = (typeof RATING_BUCKETS)[number];

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

const hotelMinPrice = (hotel: Hotel) => {
  const candidates: number[] = [];
  const main = parsePrice(hotel.priceFrom || "");
  if (!isNaN(main)) candidates.push(main);
  (hotel.rooms || []).forEach((room) => {
    const p = parsePrice(room.price || "");
    if (!isNaN(p)) candidates.push(p);
  });
  if (candidates.length === 0) return NaN;
  return Math.min(...candidates);
};

export default function Accommodation() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    searchParams.get("location") ? [searchParams.get("location")!] : []
  );
  const [maxPrice, setMaxPrice] = useState<number>(999999);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<RatingBucket>("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelCategories, setHotelCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadHotels = async () => {
      setIsLoading(true);
      setError("");
      try {
        const first = await fetch(getApiUrl(`/api/hotels?page=1&limit=${PAGE_SIZE}`));
        const firstData = await parseJsonSafely(first);
        if (!first.ok) {
          setError(firstData?.message || "Failed to load hotels.");
          setHotels([]);
          return;
        }
        const totalPages: number = Math.max(Number(firstData?.totalPages) || 1, 1);
        const collected: Hotel[] = (Array.isArray(firstData?.data)
          ? firstData.data.map(normalizeHotel).filter(Boolean)
          : []) as Hotel[];

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(getApiUrl(`/api/hotels?page=${i + 2}&limit=${PAGE_SIZE}`)).then(
                parseJsonSafely
              )
            )
          );
          rest.forEach((data) => {
            if (Array.isArray(data?.data)) {
              (data.data.map(normalizeHotel).filter(Boolean) as Hotel[]).forEach((h) =>
                collected.push(h)
              );
            }
          });
        }

        setHotels(collected);
      } catch {
        setError("Unable to load hotels from the server.");
        setHotels([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadHotels();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(getApiUrl("/api/hotel-categories"));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setHotelCategories(data.data);
        }
      } catch {
        /* silent fallback to categories derived from hotels */
      }
    };
    void loadCategories();
  }, []);

  // dynamic options
  const priceMax = useMemo(() => {
    const prices = hotels.map(hotelMinPrice).filter((n) => !isNaN(n));
    return prices.length > 0 ? Math.max(...prices) : 50000;
  }, [hotels]);

  useEffect(() => {
    if (hotels.length > 0 && !priceInitialized) {
      setMaxPrice(priceMax);
      setPriceInitialized(true);
    }
  }, [hotels, priceMax, priceInitialized]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategories,
    selectedLocations,
    maxPrice,
    ratingFilter,
    featuredOnly,
  ]);

  const allCategories = useMemo(() => {
    const fromBackend = hotelCategories.map((c) => c.name);
    const fromHotels = hotels.map((h) => h.category).filter(Boolean) as string[];
    return Array.from(new Set([...fromBackend, ...fromHotels])).sort();
  }, [hotels, hotelCategories]);

  const allLocations = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.location).filter(Boolean))).sort(),
    [hotels]
  );

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      if (featuredOnly && !hotel.featured) return false;

      if (selectedCategories.length > 0 && !selectedCategories.includes(hotel.category || ""))
        return false;

      if (selectedLocations.length > 0 && !selectedLocations.includes(hotel.location))
        return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hay =
          `${hotel.name} ${hotel.location} ${hotel.category || ""} ${hotel.description || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      const minPrice = hotelMinPrice(hotel);
      if (!isNaN(minPrice) && minPrice > maxPrice) return false;

      if (ratingFilter !== "All") {
        const r = Number(hotel.rating) || 0;
        if (ratingFilter === "4.5+" && r < 4.5) return false;
        if (ratingFilter === "4+" && r < 4) return false;
        if (ratingFilter === "3.5+" && r < 3.5) return false;
        if (ratingFilter === "3+" && r < 3) return false;
      }

      return true;
    });
  }, [
    hotels,
    selectedCategories,
    selectedLocations,
    searchQuery,
    maxPrice,
    ratingFilter,
    featuredOnly,
  ]);

  const totalPages = Math.max(Math.ceil(filteredHotels.length / PAGE_SIZE), 1);
  const paginated = filteredHotels.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterCount =
    selectedCategories.length +
    selectedLocations.length +
    (ratingFilter !== "All" ? 1 : 0) +
    (priceInitialized && maxPrice < priceMax ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (featuredOnly ? 1 : 0);

  const clearFilters = () => {
    setMaxPrice(priceMax);
    setRatingFilter("All");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSearchQuery("");
    setFeaturedOnly(false);
  };

  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const toggleLocation = (loc: string) =>
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((x) => x !== loc) : [...prev, loc]
    );

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
            placeholder="Search hotels..."
            className="text-sm bg-transparent outline-none text-white placeholder:text-white/30 w-full"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")}>
              <X className="w-3 h-3 text-white/40 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* category */}
      {allCategories.length > 0 && (
        <FilterSection title="Hotel Category">
          <div className="space-y-1">
            {allCategories.map((cat) => {
              const count = hotels.filter((h) => h.category === cat).length;
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

      {/* locations */}
      {allLocations.length > 0 && (
        <FilterSection title="Location" defaultOpen={false}>
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {allLocations.map((loc) => {
              const count = hotels.filter((h) => h.location === loc).length;
              const active = selectedLocations.includes(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => toggleLocation(loc)}
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
                      {loc}
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

      {/* price */}
      <FilterSection title="Budget (Per Night)">
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

      {/* rating */}
      <FilterSection title="Guest Rating">
        <div className="space-y-1">
          {RATING_BUCKETS.map((bucket) => {
            const active = ratingFilter === bucket;
            const count =
              bucket === "All"
                ? hotels.length
                : hotels.filter((h) => {
                    const r = Number(h.rating) || 0;
                    if (bucket === "4.5+") return r >= 4.5;
                    if (bucket === "4+") return r >= 4;
                    if (bucket === "3.5+") return r >= 3.5;
                    if (bucket === "3+") return r >= 3;
                    return false;
                  }).length;
            return (
              <button
                key={bucket}
                type="button"
                onClick={() => setRatingFilter(bucket)}
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
                    {bucket === "All" ? "All Ratings" : `${bucket} Stars`}
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

      {/* featured toggle */}
      {hotels.some((h) => h.featured) && (
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
                Featured hotels only
              </span>
            </div>
          </button>
        </FilterSection>
      )}

      {/* clear */}
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
        title="Luxury Hotels & Stays | Hunza, Skardu, Gilgit Accommodations"
        description="Browse handpicked hotels, resorts, and boutique stays across Northern Pakistan. Compare rooms, ratings, and prices managed live from our admin inventory."
        keywords="hotels in Hunza, Skardu resorts, Gilgit accommodations, luxury stays Pakistan, Northern Pakistan hotels, boutique hotels"
      />
      <Navbar />

      {/* Hero (no banner image — matches Tour Packages style) */}
      <section className="relative pt-28 sm:pt-32 pb-10 sm:pb-12 bg-lux-bg text-lux-primary px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="text-lux-accent text-xs uppercase tracking-[0.4em] font-bold mb-4">
                Exquisite Stays
              </div>
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-[1.1]">
                Rest in <br />
                <span className="text-lux-accent italic font-light font-body">Paradise</span>
              </h1>
            </div>
            <div className="lg:pb-4">
              <p className="text-base opacity-70 max-w-xl font-light leading-relaxed mb-6">
                Handpicked hotels, boutique resorts, and mountain lodges across Northern Pakistan.
                Compare rooms, amenities, and pricing — every property is maintained live from our
                admin inventory.
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
            {filteredHotels.length} hotel{filteredHotels.length !== 1 ? "s" : ""}
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

        {/* mobile sidebar overlay */}
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

        {/* main content */}
        <div className="flex-1 min-w-0 px-4 sm:px-8 lg:px-10 py-0">
          {!isLoading && !error && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                  {filteredHotels.length} hotel{filteredHotels.length !== 1 ? "s" : ""} found
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
                <span className="text-sm">Loading hotels...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">Unable to Load Hotels</h3>
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
              <h3 className="font-headings text-2xl mb-2">No Hotels Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or come back soon — new properties are added regularly.
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
              {paginated.map((hotel, i) => (
                <Link
                  to={`/hotels/${hotel.id}`}
                  key={hotel.id}
                  className="group cursor-pointer bg-white overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-500 animate-in fade-in zoom-in-95 rounded-2xl sm:rounded-none border border-border/60 sm:border-0 shadow-sm sm:shadow-none"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className="relative h-48 bg-cover bg-center overflow-hidden"
                    style={{
                      backgroundImage: `url('${
                        hotel.image ||
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200"
                      }')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
                    <div
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${
                          hotel.image ||
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200"
                        }')`,
                        zIndex: -1,
                      }}
                    />
                    {hotel.category && (
                      <div className="absolute top-3 left-3 bg-lux-primary text-white text-[9px] uppercase tracking-[0.18em] px-2.5 py-1 font-bold">
                        {hotel.category}
                      </div>
                    )}
                    {hotel.rating && hotel.rating > 0 ? (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-lux-primary inline-flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-lux-accent fill-lux-accent" />
                        {hotel.rating.toFixed(1)}
                      </div>
                    ) : null}
                    {hotel.priceFrom ? (
                      <div className="absolute bottom-3 right-3 bg-white text-lux-primary px-2.5 py-1">
                        <p className="text-[8px] uppercase tracking-widest text-lux-primary/50 leading-none mb-0.5">
                          From
                        </p>
                        <p className="text-xs font-bold leading-none">{hotel.priceFrom}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col border-b border-l border-r border-border">
                    <h3 className="font-headings text-lg leading-snug mb-1 group-hover:text-lux-accent transition-colors duration-300 line-clamp-1">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-lux-primary/60 mb-2.5">
                      <MapPin className="w-3 h-3 text-lux-accent shrink-0" />
                      <span className="truncate">{hotel.location}</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
                      {hotel.description ||
                        "Premium accommodation in a scenic setting."}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-lux-primary/60 min-w-0">
                        <BedDouble className="w-3 h-3 text-lux-accent shrink-0" />
                        <span className="truncate">
                          {hotel.rooms && hotel.rooms.length > 0
                            ? `${hotel.rooms.length} room${
                                hotel.rooms.length !== 1 ? "s" : ""
                              }`
                            : "Available"}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.18em] text-lux-accent font-bold group-hover:underline shrink-0">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
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
