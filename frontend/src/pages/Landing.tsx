import { Search, MapPin, ChevronDown, ChevronLeft, ChevronRight, Package, Star, Compass, ShieldCheck, Headset, CheckCircle, LoaderCircle, Plane, BedDouble, UserCheck, Car, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
};

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/$/, "");

const FEATURED_FALLBACKS = [
  {
    id: "fallback-santorini",
    name: "Santorini",
    location: "Greece",
    price: "From PKR 2,400",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "fallback-kyoto",
    name: "Kyoto",
    location: "Japan",
    price: "From Rs. 1,800",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "fallback-zermatt",
    name: "Zermatt",
    location: "Switzerland",
    price: "From Rs. 3,100",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800",
  },
];

const WA_URL = "https://wa.me/923488142776";

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

function normalizeDestination(input: unknown): Destination | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const destination = input as Destination;
  if (!destination.id || !destination.name || !destination.location) {
    return null;
  }

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
  };
}

export default function Landing() {
  const navigate = useNavigate();
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [featuredTours, setFeaturedTours] = useState<{
    id: string; title: string; destinations: string[]; duration: string;
    price: string; image: string; type: string; description: string;
  }[]>([]);
  const [isToursLoading, setIsToursLoading] = useState(true);
  const [seasonalTours, setSeasonalTours] = useState<{
    id: string; title: string; destinations: string[]; duration: string;
    price: string; image: string; type: string; description: string;
  }[]>([]);
  const [isSeasonalLoading, setIsSeasonalLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<{
    _id: string; quote: string; name: string; location: string; image: string;
  }[]>([]);
  const [isTestimonialsLoading, setIsTestimonialsLoading] = useState(true);

  // hero slider state
  const [heroSlides, setHeroSlides] = useState<{
    _id: string; heading: string; subheading: string; description: string; backgroundImage: string;
  }[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  // hero search state
  const [searchDestination, setSearchDestination] = useState("");
  const [searchType, setSearchType] = useState("");
  const [allTourPackages, setAllTourPackages] = useState<{ type: string; destinations: string[] }[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [dynamicTourTypes, setDynamicTourTypes] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    const loadFeaturedDestinations = async () => {
      setIsFeaturedLoading(true);

      try {
        const response = await fetch(getApiUrl("/api/destinations/featured"));
        const data = await parseJsonSafely(response);

        if (!response.ok) {
          setFeaturedDestinations([]);
          return;
        }

        const normalizedDestinations = Array.isArray(data?.data)
          ? data.data.map(normalizeDestination).filter(Boolean)
          : [];

        setFeaturedDestinations(normalizedDestinations as Destination[]);
      } catch {
        setFeaturedDestinations([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    };

    void loadFeaturedDestinations();
  }, []);

  // fetch hero slides
  useEffect(() => {
    const loadHeroes = async () => {
      try {
        const response = await fetch(getApiUrl('/api/heroes'));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data) && data.data.length > 0) {
          setHeroSlides(data.data);
        }
      } catch { /* silent — fallback shows */ }
    };
    void loadHeroes();
  }, []);

  // auto-play slider
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const loadFeaturedTours = async () => {
      setIsToursLoading(true);
      try {
        const response = await fetch(getApiUrl("/api/tour-packages/featured"));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setFeaturedTours(data.data.filter((t: { id?: string; title?: string }) => t?.id && t?.title));
        }
      } catch {
        setFeaturedTours([]);
      } finally {
        setIsToursLoading(false);
      }
    };
    void loadFeaturedTours();
  }, []);

  useEffect(() => {
    const loadSeasonalTours = async () => {
      setIsSeasonalLoading(true);
      try {
        const response = await fetch(getApiUrl("/api/tour-packages?isSeasonal=true"));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setSeasonalTours(data.data.filter((t: { id?: string; title?: string }) => t?.id && t?.title));
        }
      } catch {
        setSeasonalTours([]);
      } finally {
        setIsSeasonalLoading(false);
      }
    };
    void loadSeasonalTours();
  }, []);

  // fetch all tour packages once for hero filter options
  useEffect(() => {
    const loadAll = async () => {
      try {
        const first = await fetch(getApiUrl("/api/tour-packages?page=1"));
        const firstData = await parseJsonSafely(first);
        if (!first.ok) return;
        const totalPages = Math.max(Number(firstData?.totalPages) || 1, 1);
        const collected = Array.isArray(firstData?.data) ? [...firstData.data] : [];
        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(getApiUrl(`/api/tour-packages?page=${i + 2}`)).then(parseJsonSafely)
            )
          );
          rest.forEach((d) => { if (Array.isArray(d?.data)) collected.push(...d.data); });
        }
        setAllTourPackages(collected.map((t: { type?: string; destinations?: string[] }) => ({
          type: t.type || "",
          destinations: Array.isArray(t.destinations) ? t.destinations : [],
        })));
      } catch { /* silent */ }
    };
    void loadAll();
  }, []);

  useEffect(() => {
    const loadTestimonials = async () => {
      setIsTestimonialsLoading(true);
      try {
        const response = await fetch(getApiUrl('/api/testimonials'));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setTestimonials(data.data.filter((t: { _id?: string; quote?: string; name?: string }) => t?._id && t?.quote && t?.name));
        }
      } catch {
        setTestimonials([]);
      } finally {
        setIsTestimonialsLoading(false);
      }
    };
    void loadTestimonials();
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

  const displayedFeaturedDestinations = featuredDestinations.length > 0
    ? featuredDestinations.slice(0, 3)
    : FEATURED_FALLBACKS;

  // dynamic options from real tour package data
  const tourTypes = useMemo(() => {
    return Array.from(new Set(allTourPackages.map((t) => t.type).filter(Boolean))).sort();
  }, [allTourPackages]);

  const allDestinationNames = useMemo(() => {
    return Array.from(
      new Set(allTourPackages.flatMap((t) => t.destinations).filter(Boolean))
    ).sort();
  }, [allTourPackages]);

  const filteredDestSuggestions = useMemo(() => {
    if (!searchDestination.trim()) return allDestinationNames.slice(0, 6);
    return allDestinationNames
      .filter((d) => d.toLowerCase().includes(searchDestination.toLowerCase()))
      .slice(0, 6);
  }, [allDestinationNames, searchDestination]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchDestination.trim()) params.set("destination", searchDestination.trim());
    if (searchType) params.set("type", searchType);
    navigate(`/tour-packages?${params.toString()}`);
  };

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO 
        title="North Paradise Treks and Tours | Best Northern Pakistan Tour Packages"
        description="Explore the breathtaking beauty of Northern Pakistan with North Paradise Treks and Tours. We offer premium and luxury tour packages to Hunza, Skardu, Gilgit, and more."
        keywords="Northern Pakistan tours, Hunza Valley tour, Skardu trip, Gilgit tourism, Pakistan luxury travel, adventure tours Pakistan, tours from Karachi, tours from Lahore, tours from Islamabad, Khunjerab Pass trip, Attabad Lake tour"
      />
      <Navbar />

      <section className="relative h-[50vh] sm:h-[70vh] min-h-[350px] sm:min-h-[500px] overflow-hidden">
        {/* slides */}
        {heroSlides.length > 0 ? heroSlides.map((slide, idx) => (
          <div
            key={slide._id}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{ backgroundImage: `url('${slide.backgroundImage}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
          </div>
        )) : (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&q=80&w=2000')" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
          </div>
        )}

        {/* content */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center mt-[-40px]">
            {heroSlides.length > 0 ? (
              <>
                {heroSlides[heroIndex].subheading ? (
                  <p className="text-lux-accent text-sm uppercase tracking-[0.25em] font-medium mb-4">{heroSlides[heroIndex].subheading}</p>
                ) : null}
                <h1 className="font-headings text-5xl sm:text-7xl mb-6">{heroSlides[heroIndex].heading}</h1>
                {heroSlides[heroIndex].description ? (
                  <p className="text-lg opacity-90 max-w-2xl mx-auto font-light">{heroSlides[heroIndex].description}</p>
                ) : null}
              </>
            ) : (
              <>
                <h1 className="font-headings text-5xl sm:text-7xl mb-6">
                  Discover the World, <br />
                  <span className="italic font-light opacity-90">Make Memories</span>
                </h1>
                <p className="text-lg opacity-90 max-w-2xl mx-auto font-light">
                  Explore amazing destinations, unforgettable experiences and incredible tour packages curated just for you.
                </p>
              </>
            )}
          </div>
        </div>

        {/* dots */}
        {heroSlides.length > 1 ? (
          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`transition-all duration-300 rounded-full bg-white ${idx === heroIndex ? 'w-6 h-2 opacity-100' : 'w-2 h-2 opacity-50'}`}
              />
            ))}
          </div>
        ) : null}

        {/* prev/next arrows */}
        {heroSlides.length > 1 ? (
          <>
            <button onClick={() => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => setHeroIndex((i) => (i + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        ) : null}
      </section>

      <div className="max-w-5xl mx-auto w-full px-6 -mt-8 sm:-mt-12 relative z-20 mb-16 sm:mb-24">
        <div className="bg-white rounded-sm shadow-xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-center w-full">

          {/* Destination input with suggestions */}
          <div className="relative flex items-center gap-3 sm:gap-4 w-full md:w-auto px-2 sm:px-4 border-b md:border-b-0 md:border-r border-border pb-3 sm:pb-0 flex-1">
            <MapPin className="text-lux-accent w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <div className="flex-1">
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Destination</div>
              <input
                type="text"
                value={searchDestination}
                onChange={(e) => { setSearchDestination(e.target.value); setShowDestSuggestions(true); }}
                onFocus={() => setShowDestSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDestSuggestions(false), 150)}
                placeholder="Where to?"
                className="text-xs sm:text-sm font-medium outline-none text-lux-primary w-full bg-transparent"
              />
            </div>
            {showDestSuggestions && filteredDestSuggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-border rounded-sm shadow-lg z-30 overflow-hidden">
                {filteredDestSuggestions.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onMouseDown={() => { setSearchDestination(dest); setShowDestSuggestions(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-lux-bg flex items-center gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-lux-accent shrink-0" />
                    {dest}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tour type dropdown */}
          <div className="relative flex items-center gap-3 sm:gap-4 w-full md:w-auto px-2 sm:px-4 border-b md:border-b-0 md:border-r border-border pb-3 sm:pb-0 flex-1">
            <Package className="text-lux-accent w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <div className="flex-1">
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Tour Type</div>
              <div className="relative">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="text-xs sm:text-sm font-medium outline-none text-lux-primary w-full bg-transparent appearance-none cursor-pointer pr-5"
                >
                  <option value="">All Types</option>
                  {dynamicTourTypes.length > 0 ? dynamicTourTypes.map((type) => (
                    <option key={type._id} value={type.name}>{type.name}</option>
                  )) : tourTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="bg-lux-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-sm text-xs sm:text-sm font-medium hover:bg-lux-primary/90 transition-colors w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer"
          >
            Search <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <section className="py-16 px-6 sm:px-12 bg-lux-bg">
        <div className="text-center mb-12">
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-3">Curated Experiences</div>
          <h2 className="font-headings text-4xl text-lux-primary">Featured Destinations</h2>
        </div>

        {isFeaturedLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading featured destinations...</span>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:flex md:flex-row gap-6 md:gap-0 h-auto md:h-[500px]">
            {displayedFeaturedDestinations.map((destination, index) => (
              <Link
                to={`/destinations/${destination.id}`}
                key={destination.id}
                className={`relative group overflow-hidden cursor-pointer h-[350px] md:h-auto md:flex-1 ${index === 1 ? "md:border-x border-white/20" : ""}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url('${destination.image || (index < FEATURED_FALLBACKS.length ? FEATURED_FALLBACKS[index].image : FEATURED_FALLBACKS[0].image)}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                  <h3 className="font-headings text-2xl sm:text-3xl mb-2">{destination.name}, {destination.location}</h3>
                  <p className="text-sm font-medium text-lux-accent">{destination.price || "Contact for pricing"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="py-24 px-6 sm:px-12 bg-white">
        <div className="text-center mb-16">
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-3">Popular Tours</div>
          <h2 className="font-headings text-4xl text-lux-primary">Our Most Popular Tours</h2>
        </div>

        {isToursLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading popular tours...</span>
            </div>
          </div>
        ) : featuredTours.length === 0 ? (
          <div className="max-w-7xl mx-auto text-center py-20 text-muted-foreground text-sm">
            No tour packages available yet.
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredTours.map((tour) => (
              <Link to={`/tour-packages/${tour.id}`} key={tour.id} className="group cursor-pointer">
                <div className="relative h-64 overflow-hidden rounded-t-sm mb-4">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${tour.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600"}')` }}></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-bold text-lux-primary">
                    {tour.price} <span className="font-normal text-muted-foreground">/person</span>
                  </div>
                </div>
                <h3 className="font-headings text-xl mb-1 group-hover:text-lux-accent transition-colors">{tour.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tour.description}</p>
                <div className="flex justify-between items-center border-t border-border pt-4 text-sm text-lux-primary font-medium">
                  <span>{tour.duration}</span>
                  <div className="flex items-center gap-1">
                    4.8 <Star className="w-3 h-3 text-lux-accent fill-lux-accent" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-12">
          <Link to="/tour-packages" className="border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-medium transition-colors cursor-pointer">
            View All Tours
          </Link>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-12 bg-lux-bg">
        <div className="text-center mb-16">
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-3">Limited Time</div>
          <h2 className="font-headings text-4xl text-lux-primary">Seasonal Packages</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto font-light text-sm">
            Experience the unique beauty of each season with our specially curated limited-time offers.
          </p>
        </div>

        {isSeasonalLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading seasonal packages...</span>
            </div>
          </div>
        ) : seasonalTours.length === 0 ? (
          <div className="max-w-7xl mx-auto text-center py-20 text-muted-foreground text-sm">
            No seasonal packages available at the moment.
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {seasonalTours.map((tour) => (
              <Link to={`/tour-packages/${tour.id}`} key={tour.id} className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 flex flex-col">
                <div className="relative h-72 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url('${tour.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800"}')` }}></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                    Seasonal
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-1.5 text-xs font-medium mb-1 drop-shadow-md">
                      <MapPin className="w-3 h-3 text-lux-accent" />
                      {tour.destinations.join(", ")}
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-headings text-2xl mb-2 group-hover:text-lux-accent transition-colors">{tour.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{tour.description}</p>
                  <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">Starting From</span>
                      <span className="text-lg font-bold text-lux-primary">{tour.price}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>


      <section className="py-24 px-6 sm:px-12 bg-lux-bg border-y border-border">
        <div className="text-center mb-16">
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-3">Why Choose Us</div>
          <h2 className="font-headings text-4xl text-lux-primary">Travel with Confidence</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 text-lux-accent shadow-sm">
              <Compass className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h3 className="font-headings text-xl mb-3">Expert Guides</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Professional guides for an amazing experience.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 text-lux-accent shadow-sm">
              <ShieldCheck className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h3 className="font-headings text-xl mb-3">Best Price Guarantee</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Get the best prices for your dream trips.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 text-lux-accent shadow-sm">
              <Headset className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h3 className="font-headings text-xl mb-3">24/7 Support</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">We are here to help you anytime, anywhere.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 text-lux-accent shadow-sm">
              <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h3 className="font-headings text-xl mb-3">Easy Booking</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Book your tour easily in just a few minutes.</p>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-24 px-6 sm:px-12 bg-lux-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-3">Featured Services</div>
            <h2 className="font-headings text-4xl sm:text-5xl text-lux-primary max-w-2xl mx-auto leading-tight">
              A wide range of travel services
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Plane, title: "Air Ticketing", description: "Domestic and international flight bookings at the best available rates, handled with care and expertise.", href: "/services/air-ticketing" },
              { icon: Truck, title: "Jeep Safari", description: "Thrilling off-road adventures through Pakistan's most breathtaking mountain passes and terrains.", href: "/services/jeep-safari" },
              { icon: BedDouble, title: "Accommodation", description: "Carefully selected hotels, guesthouses, and mountain camps tailored to your comfort and budget.", href: "/services/accommodation" },
              { icon: UserCheck, title: "Tour Guide", description: "Experienced, knowledgeable local guides who bring destinations to life with authentic stories.", href: "/services/tour-guide" },
              { icon: Car, title: "Jeep / Car Rent", description: "Reliable vehicles for self-drive or chauffeur-driven travel across Pakistan's scenic routes.", href: "/services/car-rent" },
            ].map((service) => (
              <Link
                key={service.title}
                to={service.href}
                className="group bg-white rounded-2xl shadow-sm border border-border p-8 flex flex-col gap-6 hover:shadow-lg hover:border-lux-accent/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-lux-accent/10 rounded-xl flex items-center justify-center group-hover:bg-lux-accent/20 transition-colors duration-300">
                  <service.icon className="w-8 h-8 text-lux-accent" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-headings text-xl text-lux-primary mb-3 group-hover:text-lux-accent transition-colors duration-300">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                </div>
                <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lux-primary group-hover:bg-lux-accent group-hover:border-lux-accent group-hover:text-white transition-all duration-300">
                  <span className="text-sm font-bold group-hover:translate-x-0.5 transition-transform duration-300">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <section className="py-24 px-6 sm:px-12 bg-white">
        <div className="text-center mb-16">
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-3">Testimonials</div>
          <h2 className="font-headings text-4xl text-lux-primary">What Our Travelers Say</h2>
        </div>
        {isTestimonialsLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading testimonials...</span>
            </div>
          </div>
        ) : testimonials.length === 0 ? null : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t._id} className="border border-border p-8 rounded-sm bg-lux-bg/50">
                <p className="italic text-muted-foreground mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-lux-primary/10 flex items-center justify-center text-lux-primary font-bold text-lg">{t.name[0]}</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-lux-primary">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="py-24 px-6 sm:px-12 bg-lux-bg flex justify-center pb-32">
        <div className="max-w-5xl mx-auto w-full relative overflow-hidden rounded-sm h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?auto=format&fit=crop&q=80&w=2000')" }}></div>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 text-center text-white px-8">
            <h2 className="font-headings text-4xl sm:text-5xl mb-6">Let's make your next journey <br /> unforgettable</h2>
            <p className="text-lg opacity-90 mb-10 max-w-xl mx-auto font-light">
              Discover the world with our exclusive tour packages and special offers.
            </p>
            <Link to="/request-quote" className="bg-lux-accent hover:bg-lux-accent/90 text-white font-bold tracking-widest uppercase text-sm px-10 py-4 rounded-sm transition-colors cursor-pointer inline-flex items-center">
              Plan Your Tour
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
