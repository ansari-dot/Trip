import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  LoaderCircle,
  SlidersHorizontal,
  ChevronDown,
  CarFront,
  Users,
  Settings2,
  Fuel,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getApiUrl, parseJsonSafely } from "../../lib/api";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";

type RentalVehicle = {
  _id?: string;
  id: string;
  name: string;
  type?: string;
  price?: string;
  image?: string;
  description?: string;
  seats?: string;
  transmission?: string;
  fuelType?: string;
  withDriver?: boolean;
  features?: string[];
  displayOrder?: number;
};

function normalizeVehicle(input: unknown): RentalVehicle | null {
  if (!input || typeof input !== "object") return null;
  const v = input as RentalVehicle;
  if (!v.id || !v.name) return null;
  return {
    _id: v._id,
    id: v.id,
    name: v.name,
    type: v.type || "",
    price: v.price || "",
    image: v.image || "",
    description: v.description || "",
    seats: v.seats || "",
    transmission: v.transmission || "",
    fuelType: v.fuelType || "",
    withDriver: Boolean(v.withDriver),
    features: Array.isArray(v.features) ? v.features : [],
    displayOrder: Number.isFinite(Number(v.displayOrder)) ? Number(v.displayOrder) : 0,
  };
}

const PAGE_SIZE = 9;

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

export default function CarRent() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("type") ? [searchParams.get("type")!] : []
  );
  const [withDriverOnly, setWithDriverOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(999999);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      setError("");
      try {
        const first = await fetch(getApiUrl(`/api/rental-vehicles?page=1&limit=${PAGE_SIZE}`));
        const firstData = await parseJsonSafely(first);
        if (!first.ok) {
          setError(firstData?.message || "Failed to load vehicles.");
          setVehicles([]);
          return;
        }
        const totalPages: number = Math.max(Number(firstData?.totalPages) || 1, 1);
        const collected: RentalVehicle[] = (Array.isArray(firstData?.data)
          ? firstData.data.map(normalizeVehicle).filter(Boolean)
          : []) as RentalVehicle[];

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(getApiUrl(`/api/rental-vehicles?page=${i + 2}&limit=${PAGE_SIZE}`)).then(
                parseJsonSafely
              )
            )
          );
          rest.forEach((data) => {
            if (Array.isArray(data?.data)) {
              (data.data.map(normalizeVehicle).filter(Boolean) as RentalVehicle[]).forEach((v) =>
                collected.push(v)
              );
            }
          });
        }
        setVehicles(collected);
      } catch {
        setError("Unable to load vehicles from the server.");
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadVehicles();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(getApiUrl("/api/vehicle-categories"));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setVehicleCategories(data.data);
        }
      } catch {
        /* silent */
      }
    };
    void loadCategories();
  }, []);

  const priceMax = useMemo(() => {
    const prices = vehicles.map((v) => parsePrice(v.price || "")).filter((n) => !isNaN(n));
    return prices.length > 0 ? Math.max(...prices) : 100000;
  }, [vehicles]);

  useEffect(() => {
    if (vehicles.length > 0 && !priceInitialized) {
      setMaxPrice(priceMax);
      setPriceInitialized(true);
    }
  }, [vehicles, priceMax, priceInitialized]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTypes, withDriverOnly, maxPrice]);

  const allTypes = useMemo(() => {
    const fromBackend = vehicleCategories.map((c) => c.name);
    const fromVehicles = vehicles.map((v) => v.type).filter(Boolean) as string[];
    return Array.from(new Set([...fromBackend, ...fromVehicles])).sort();
  }, [vehicles, vehicleCategories]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (withDriverOnly && !v.withDriver) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(v.type || "")) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hay =
          `${v.name} ${v.type || ""} ${v.description || ""} ${v.transmission || ""} ${v.fuelType || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const price = parsePrice(v.price || "");
      if (!isNaN(price) && price > maxPrice) return false;
      return true;
    });
  }, [vehicles, selectedTypes, withDriverOnly, searchQuery, maxPrice]);

  const totalPages = Math.max(Math.ceil(filteredVehicles.length / PAGE_SIZE), 1);
  const paginated = filteredVehicles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterCount =
    selectedTypes.length +
    (withDriverOnly ? 1 : 0) +
    (priceInitialized && maxPrice < priceMax ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const clearFilters = () => {
    setMaxPrice(priceMax);
    setSelectedTypes([]);
    setSearchQuery("");
    setWithDriverOnly(false);
  };

  const toggleType = (t: string) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const FilterPanel = (
    <div>
      <div className="px-6 py-4 border-b border-white/8">
        <div className="flex items-center gap-2 bg-white/8 border border-white/15 px-3 py-2.5 focus-within:border-lux-accent transition-colors">
          <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicles..."
            className="text-sm bg-transparent outline-none text-white placeholder:text-white/30 w-full"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")}>
              <X className="w-3 h-3 text-white/40 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      {allTypes.length > 0 && (
        <FilterSection title="Vehicle Type">
          <div className="space-y-1">
            {allTypes.map((type) => {
              const count = vehicles.filter((v) => v.type === type).length;
              const active = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
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
                      {type}
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

      <FilterSection title="Daily Rate" defaultOpen={false}>
        <div className="space-y-4">
          <div className="text-center">
            <span className="font-headings text-2xl text-white">
              PKR {maxPrice.toLocaleString()}
            </span>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
              Maximum Per Day
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

      <FilterSection title="Options" defaultOpen={false}>
        <button
          type="button"
          onClick={() => setWithDriverOnly((prev) => !prev)}
          className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer group ${
            withDriverOnly
              ? "bg-lux-accent/20 border-l-2 border-lux-accent"
              : "border-l-2 border-transparent hover:bg-white/5 hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${
                withDriverOnly
                  ? "bg-lux-accent border-lux-accent"
                  : "border-white/30 group-hover:border-white/60"
              }`}
            >
              {withDriverOnly && <div className="w-1.5 h-1.5 bg-white" />}
            </div>
            <span
              className={`text-sm transition-colors ${
                withDriverOnly ? "text-white font-medium" : "text-white/65 group-hover:text-white"
              }`}
            >
              With driver only
            </span>
          </div>
        </button>
      </FilterSection>

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
        title="Car & Jeep Rental | Skardu, Hunza, Gilgit"
        description="Rent 4x4 jeeps, SUVs, and sedans across Northern Pakistan. Compare types, seats, transmission, and daily rates — all managed live from our admin."
        keywords="car rental Pakistan, jeep rental Skardu, 4x4 rent Hunza, Gilgit vehicle hire"
      />
      <Navbar />

      <section className="relative pt-28 sm:pt-32 pb-10 sm:pb-12 bg-lux-bg text-lux-primary px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="text-lux-accent text-xs uppercase tracking-[0.4em] font-bold mb-4">
                Premium Fleet
              </div>
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-[1.1]">
                Drive the <br />
                <span className="text-lux-accent italic font-light font-body">Mountains</span>
              </h1>
            </div>
            <div className="lg:pb-4">
              <p className="text-base opacity-70 max-w-xl font-light leading-relaxed mb-6">
                4x4 jeeps, luxury SUVs, and comfortable sedans for every road in Northern Pakistan.
                Self-drive or with an experienced driver — your journey, your choice.
              </p>
              <div className="w-20 h-px bg-lux-accent" />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full pt-8 sm:pt-16 pb-12 flex-1 flex flex-col lg:flex-row gap-0 border-t border-border/50">
        <div className="lg:hidden flex items-center justify-between mb-3 px-4 sm:px-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""}
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
                  {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""} found
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
                <span className="text-sm">Loading vehicles...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">Unable to Load Vehicles</h3>
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
              <h3 className="font-headings text-2xl mb-2">No Vehicles Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or come back soon — new vehicles are added regularly.
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
              {paginated.map((vehicle, i) => (
                <Link
                  to={`/rental-vehicles/${vehicle.id}`}
                  key={vehicle.id}
                  className="group cursor-pointer bg-white overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-500 animate-in fade-in zoom-in-95 rounded-2xl sm:rounded-none border border-border/60 sm:border-0 shadow-sm sm:shadow-none"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className="relative h-48 bg-cover bg-center overflow-hidden"
                    style={{
                      backgroundImage: `url('${
                        vehicle.image ||
                        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200"
                      }')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
                    {vehicle.type ? (
                      <div className="absolute top-3 left-3 bg-lux-primary text-white text-[9px] uppercase tracking-[0.18em] px-2.5 py-1 font-bold">
                        {vehicle.type}
                      </div>
                    ) : null}
                    {vehicle.withDriver ? (
                      <div className="absolute top-3 right-3 bg-lux-accent text-white text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold">
                        + Driver
                      </div>
                    ) : null}
                    {vehicle.price ? (
                      <div className="absolute bottom-3 right-3 bg-white text-lux-primary px-2.5 py-1">
                        <p className="text-[8px] uppercase tracking-widest text-lux-primary/50 leading-none mb-0.5">
                          Per Day
                        </p>
                        <p className="text-xs font-bold leading-none">{vehicle.price}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col border-b border-l border-r border-border">
                    <h3 className="font-headings text-lg leading-snug mb-2 group-hover:text-lux-accent transition-colors duration-300 line-clamp-1">
                      {vehicle.name}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-2">
                      {vehicle.description ||
                        "Reliable vehicle for mountain roads and city travel."}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-lux-primary/60 min-w-0">
                        <Users className="w-3 h-3 text-lux-accent shrink-0" />
                        <span className="truncate">{vehicle.seats || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-lux-primary/60 min-w-0">
                        <Settings2 className="w-3 h-3 text-lux-accent shrink-0" />
                        <span className="truncate">{vehicle.transmission || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-lux-primary/60 min-w-0">
                        <Fuel className="w-3 h-3 text-lux-accent shrink-0" />
                        <span className="truncate">{vehicle.fuelType || "—"}</span>
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
