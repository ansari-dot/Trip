import { Search, MapPin, ChevronDown, ChevronLeft, ChevronRight, Package, Star, Compass, ShieldCheck, Headset, CheckCircle, LoaderCircle, Calendar, Tag, CloudSun, Wind } from "lucide-react";
import { getApiUrl, parseJsonSafely, API_BASE } from "../lib/api";
import { whatsAppUrl } from "../lib/site";
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
  latitude?: number;
  longitude?: number;
};

type Blog = {
  _id?: string;
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  image?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
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
  featured?: boolean;
  displayOrder?: number;
};

type JeepSafariCard = {
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
  featured?: boolean;
  displayOrder?: number;
};

type TourGuideCard = {
  _id?: string;
  id: string;
  name: string;
  image?: string;
  shortBio?: string;
  bio?: string;
  experience?: string;
  pricePerDay?: string;
  category?: string;
  region?: string;
  baseCity?: string;
  rating?: number;
  totalTrips?: number;
  featured?: boolean;
  displayOrder?: number;
};

type RentalVehicleCard = {
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
  displayOrder?: number;
};

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
    latitude: destination.latitude,
    longitude: destination.longitude,
  };
}

function normalizeBlog(input: unknown): Blog | null {
  if (!input || typeof input !== "object") return null;
  const blog = input as Blog;
  if (!blog.id || !blog.title || !blog.content) return null;
  return {
    _id: blog._id,
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt || "",
    content: blog.content,
    image: blog.image || "",
    category: blog.category || "",
    author: blog.author || "",
    publishedAt: blog.publishedAt || "",
  };
}

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
    featured: Boolean(hotel.featured),
    displayOrder: Number.isFinite(Number(hotel.displayOrder)) ? Number(hotel.displayOrder) : 0,
  };
}

function normalizeSafariCard(input: unknown): JeepSafariCard | null {
  if (!input || typeof input !== "object") return null;
  const s = input as JeepSafariCard;
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
    featured: Boolean(s.featured),
    displayOrder: Number.isFinite(Number(s.displayOrder)) ? Number(s.displayOrder) : 0,
  };
}

function normalizeGuideCard(input: unknown): TourGuideCard | null {
  if (!input || typeof input !== "object") return null;
  const g = input as TourGuideCard;
  if (!g.id || !g.name) return null;
  return {
    _id: g._id,
    id: g.id,
    name: g.name,
    image: g.image || "",
    shortBio: g.shortBio || "",
    bio: g.bio || "",
    experience: g.experience || "",
    pricePerDay: g.pricePerDay || "",
    category: g.category || "",
    region: g.region || "",
    baseCity: g.baseCity || "",
    rating: Number.isFinite(Number(g.rating)) ? Number(g.rating) : 0,
    totalTrips: Number.isFinite(Number(g.totalTrips)) ? Number(g.totalTrips) : 0,
    featured: Boolean(g.featured),
    displayOrder: Number.isFinite(Number(g.displayOrder)) ? Number(g.displayOrder) : 0,
  };
}

function normalizeRentalVehicleCard(input: unknown): RentalVehicleCard | null {
  if (!input || typeof input !== "object") return null;
  const v = input as RentalVehicleCard;
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
    displayOrder: Number.isFinite(Number(v.displayOrder)) ? Number(v.displayOrder) : 0,
  };
}

// Weather Box Component
function WeatherBox({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  const [weather, setWeather] = useState<{ 
    current: { temperature: number; humidity: number; windSpeed: number; weatherCode: number };
    daily: { tempMax: number[]; tempMin: number[] };
  } | null>(null);
  const [loading, setLoading] = useState(false);

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
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isBlogsLoading, setIsBlogsLoading] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isHotelsLoading, setIsHotelsLoading] = useState(true);
  const [safaris, setSafaris] = useState<JeepSafariCard[]>([]);
  const [isSafarisLoading, setIsSafarisLoading] = useState(true);
  const [guides, setGuides] = useState<TourGuideCard[]>([]);
  const [isGuidesLoading, setIsGuidesLoading] = useState(true);
  const [rentalVehicles, setRentalVehicles] = useState<RentalVehicleCard[]>([]);
  const [isRentalVehiclesLoading, setIsRentalVehiclesLoading] = useState(true);

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

  useEffect(() => {
    const loadBlogs = async () => {
      setIsBlogsLoading(true);
      try {
        const response = await fetch(getApiUrl('/api/blogs?limit=4'));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setBlogs(data.data.map(normalizeBlog).filter(Boolean) as Blog[]);
        } else {
          setBlogs([]);
        }
      } catch {
        setBlogs([]);
      } finally {
        setIsBlogsLoading(false);
      }
    };
    void loadBlogs();
  }, []);

  useEffect(() => {
    const loadHotels = async () => {
      setIsHotelsLoading(true);
      try {
        const featuredRes = await fetch(getApiUrl('/api/hotels?featured=true'));
        const featuredData = await parseJsonSafely(featuredRes);
        let collected: Hotel[] = [];
        if (featuredRes.ok && Array.isArray(featuredData?.data)) {
          collected = (featuredData.data.map(normalizeHotel).filter(Boolean) as Hotel[]);
        }
        if (collected.length === 0) {
          const allRes = await fetch(getApiUrl('/api/hotels'));
          const allData = await parseJsonSafely(allRes);
          if (allRes.ok && Array.isArray(allData?.data)) {
            collected = (allData.data.map(normalizeHotel).filter(Boolean) as Hotel[]);
          }
        }
        setHotels(collected.slice(0, 4));
      } catch {
        setHotels([]);
      } finally {
        setIsHotelsLoading(false);
      }
    };
    void loadHotels();
  }, []);

  useEffect(() => {
    const loadSafaris = async () => {
      setIsSafarisLoading(true);
      try {
        const featuredRes = await fetch(getApiUrl('/api/jeep-safaris?featured=true'));
        const featuredData = await parseJsonSafely(featuredRes);
        let collected: JeepSafariCard[] = [];
        if (featuredRes.ok && Array.isArray(featuredData?.data)) {
          collected = (featuredData.data.map(normalizeSafariCard).filter(Boolean) as JeepSafariCard[]);
        }
        if (collected.length === 0) {
          const allRes = await fetch(getApiUrl('/api/jeep-safaris?page=1&limit=4'));
          const allData = await parseJsonSafely(allRes);
          if (allRes.ok && Array.isArray(allData?.data)) {
            collected = (allData.data.map(normalizeSafariCard).filter(Boolean) as JeepSafariCard[]);
          }
        }
        setSafaris(collected.slice(0, 4));
      } catch {
        setSafaris([]);
      } finally {
        setIsSafarisLoading(false);
      }
    };
    void loadSafaris();
  }, []);

  useEffect(() => {
    const loadGuides = async () => {
      setIsGuidesLoading(true);
      try {
        const featuredRes = await fetch(getApiUrl('/api/tour-guides?featured=true'));
        const featuredData = await parseJsonSafely(featuredRes);
        let collected: TourGuideCard[] = [];
        if (featuredRes.ok && Array.isArray(featuredData?.data)) {
          collected = (featuredData.data.map(normalizeGuideCard).filter(Boolean) as TourGuideCard[]);
        }
        if (collected.length === 0) {
          const allRes = await fetch(getApiUrl('/api/tour-guides?page=1&limit=4'));
          const allData = await parseJsonSafely(allRes);
          if (allRes.ok && Array.isArray(allData?.data)) {
            collected = (allData.data.map(normalizeGuideCard).filter(Boolean) as TourGuideCard[]);
          }
        }
        setGuides(collected.slice(0, 4));
      } catch {
        setGuides([]);
      } finally {
        setIsGuidesLoading(false);
      }
    };
    void loadGuides();
  }, []);

  useEffect(() => {
    const loadRentalVehicles = async () => {
      setIsRentalVehiclesLoading(true);
      try {
        const featuredRes = await fetch(getApiUrl('/api/rental-vehicles?featured=true'));
        const featuredData = await parseJsonSafely(featuredRes);
        let collected: RentalVehicleCard[] = [];
        if (featuredRes.ok && Array.isArray(featuredData?.data)) {
          collected = (featuredData.data.map(normalizeRentalVehicleCard).filter(Boolean) as RentalVehicleCard[]);
        }
        if (collected.length === 0) {
          const allRes = await fetch(getApiUrl('/api/rental-vehicles?page=1&limit=4'));
          const allData = await parseJsonSafely(allRes);
          if (allRes.ok && Array.isArray(allData?.data)) {
            collected = (allData.data.map(normalizeRentalVehicleCard).filter(Boolean) as RentalVehicleCard[]);
          }
        }
        setRentalVehicles(collected.slice(0, 4));
      } catch {
        setRentalVehicles([]);
      } finally {
        setIsRentalVehiclesLoading(false);
      }
    };
    void loadRentalVehicles();
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

      {/* Mobile: search sits below hero (full width). Desktop: overlaps hero with -mt-12. */}
      <div className="relative z-10 mb-12 sm:mb-24">
      <section className="relative h-[22rem] min-h-[300px] sm:h-[70vh] sm:min-h-[500px] overflow-hidden">
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
        <div className="relative z-20 h-full flex items-center justify-center px-3">
          <div className="text-center text-white max-w-4xl mx-auto flex flex-col items-center mt-0 sm:mt-[-40px] py-6 sm:py-0">
            {heroSlides.length > 0 ? (
              <>
                {heroSlides[heroIndex].subheading ? (
                  <p className="text-lux-accent text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium mb-3 sm:mb-4">{heroSlides[heroIndex].subheading}</p>
                ) : null}
                <h1 className="font-headings text-[clamp(1.65rem,6.5vw,2.5rem)] sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-[1.12] sm:leading-tight px-1">{heroSlides[heroIndex].heading}</h1>
                {heroSlides[heroIndex].description ? (
                  <p className="text-sm sm:text-lg opacity-90 max-w-2xl mx-auto font-light leading-relaxed">{heroSlides[heroIndex].description}</p>
                ) : null}
              </>
            ) : (
              <>
                <h1 className="font-headings text-[clamp(1.65rem,6.5vw,2.5rem)] sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-[1.12] sm:leading-tight px-1">
                  Discover the World, <br />
                  <span className="italic font-light opacity-90">Make Memories</span>
                </h1>
                <p className="text-sm sm:text-lg opacity-90 max-w-2xl mx-auto font-light leading-relaxed px-1">
                  Explore amazing destinations, unforgettable experiences and incredible tour packages curated just for you.
                </p>
              </>
            )}
          </div>
        </div>

        {/* dots */}
        {heroSlides.length > 1 ? (
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex justify-center gap-2 pb-[env(safe-area-inset-bottom)]">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setHeroIndex(idx)}
                className={`transition-all duration-300 rounded-full bg-white ${idx === heroIndex ? 'w-6 h-2 opacity-100' : 'w-2 h-2 opacity-50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        ) : null}

        {/* prev/next arrows */}
        {heroSlides.length > 1 ? (
          <>
            <button type="button" onClick={() => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)} className="hidden sm:flex absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full transition-colors touch-manipulation" aria-label="Previous slide">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button type="button" onClick={() => setHeroIndex((i) => (i + 1) % heroSlides.length)} className="hidden sm:flex absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full transition-colors touch-manipulation" aria-label="Next slide">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        ) : null}
      </section>

      <div className="relative z-30 w-full max-w-5xl max-sm:max-w-none mx-auto px-0 sm:px-6 max-sm:mt-0 sm:-mt-12">
        <div className="bg-white w-full max-sm:rounded-none max-sm:border-x-0 max-sm:border-y max-sm:border-border/40 max-sm:shadow-md sm:rounded-sm shadow-xl sm:shadow-xl border border-border/40 p-3 sm:p-4 flex flex-row items-end gap-2 sm:gap-4 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] md:items-center md:overflow-visible">

          {/* Destination input with suggestions */}
          <div className="relative flex min-w-0 flex-1 basis-[30%] items-center gap-2 sm:gap-4 px-2 sm:px-4 border-r border-border">
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
          <div className="relative flex min-w-0 flex-1 basis-[28%] items-center gap-2 sm:gap-4 px-2 sm:px-4 border-r border-border">
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
            type="button"
            onClick={handleSearch}
            className="bg-lux-primary text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-sm text-xs sm:text-sm font-medium hover:bg-lux-primary/90 transition-colors shrink-0 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer self-end mb-0.5 sm:mb-0"
          >
            Search <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>

      <section className="py-12 sm:py-16 px-0 sm:px-8 lg:px-12 bg-lux-bg overflow-hidden">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Curated Experiences</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary">Featured Destinations</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-md mx-auto md:hidden">Swipe to explore — tap a card for the full guide.</p>
        </div>

        {isFeaturedLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-16 sm:py-20 px-4">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-2xl sm:rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading featured destinations...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal snap carousel */}
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [touch-action:pan-x_pan-y] pb-2 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {displayedFeaturedDestinations.map((destination, index) => (
                <Link
                  to={`/destinations/${destination.id}`}
                  key={`m-${destination.id}`}
                  className="relative group shrink-0 snap-center w-[min(88vw,20.5rem)] overflow-hidden cursor-pointer h-[22rem] rounded-2xl shadow-lg ring-1 ring-black/10"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 active:scale-[1.02]"
                    style={{ backgroundImage: `url('${destination.image || (index < FEATURED_FALLBACKS.length ? FEATURED_FALLBACKS[index].image : FEATURED_FALLBACKS[0].image)}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute top-4 left-4 z-10">
                    <WeatherBox latitude={destination.latitude} longitude={destination.longitude} />
                  </div>
                  <div className="absolute bottom-0 left-0 p-5 text-white w-full">
                    <h3 className="font-headings text-xl leading-snug mb-1.5">{destination.name}, {destination.location}</h3>
                    <p className="text-xs font-semibold text-lux-accent tracking-wide">{destination.price || "Contact for pricing"}</p>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop / tablet: editorial strip */}
            <div className="hidden md:flex max-w-7xl mx-auto flex-row gap-0 h-[500px] px-4 lg:px-0">
              {displayedFeaturedDestinations.map((destination, index) => (
                <Link
                  to={`/destinations/${destination.id}`}
                  key={destination.id}
                  className={`relative group overflow-hidden cursor-pointer flex-1 ${index === 1 ? "border-x border-white/20" : ""}`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                    style={{ backgroundImage: `url('${destination.image || (index < FEATURED_FALLBACKS.length ? FEATURED_FALLBACKS[index].image : FEATURED_FALLBACKS[0].image)}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 z-10">
                    <WeatherBox latitude={destination.latitude} longitude={destination.longitude} />
                  </div>
                  <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                    <h3 className="font-headings text-2xl sm:text-3xl mb-2">{destination.name}, {destination.location}</h3>
                    <p className="text-sm font-medium text-lux-accent">{destination.price || "Contact for pricing"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-white">
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Popular Tours</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary px-2">Our Most Popular Tours</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-md mx-auto md:hidden">Swipe to explore our featured tours.</p>
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
          <>
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [touch-action:pan-x_pan-y] pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {featuredTours.map((tour) => (
                <Link to={`/tour-packages/${tour.id}`} key={`m-${tour.id}`} className="group relative shrink-0 snap-center w-[min(88vw,20.5rem)] overflow-hidden rounded-2xl bg-white border border-border/70 shadow-sm">
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${tour.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600"}')` }}></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-bold text-lux-primary">
                      {tour.price} <span className="font-normal text-muted-foreground">/person</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-headings text-lg mb-1 group-hover:text-lux-accent transition-colors">{tour.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tour.description}</p>
                    <div className="flex justify-between items-center border-t border-border pt-3 text-sm text-lux-primary font-medium">
                      <span>{tour.duration}</span>
                      <div className="flex items-center gap-1">
                        4.8 <Star className="w-3 h-3 text-lux-accent fill-lux-accent" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="hidden md:grid max-w-7xl mx-auto grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredTours.map((tour) => (
                <Link to={`/tour-packages/${tour.id}`} key={tour.id} className="group cursor-pointer rounded-none overflow-hidden bg-transparent border-0 shadow-none">
                  <div className="relative h-64 overflow-hidden rounded-t-sm mb-4">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${tour.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600"}')` }}></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-bold text-lux-primary">
                      {tour.price} <span className="font-normal text-muted-foreground">/person</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headings text-xl mb-1 group-hover:text-lux-accent transition-colors">{tour.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tour.description}</p>
                    <div className="flex justify-between items-center border-t border-border pt-4 text-sm text-lux-primary font-medium">
                      <span>{tour.duration}</span>
                      <div className="flex items-center gap-1">
                        4.8 <Star className="w-3 h-3 text-lux-accent fill-lux-accent" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-center mt-12">
          <Link to="/tour-packages" className="border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-medium transition-colors cursor-pointer">
            View All Tours
          </Link>
        </div>
      </section>

      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-lux-bg">
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Limited Time</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary px-2">Seasonal Packages</h2>
          <p className="text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto font-light text-xs sm:text-sm px-2">
            Experience the unique beauty of each season with our specially curated limited-time offers.
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-md mx-auto md:hidden">Swipe to browse seasonal tours.</p>
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
          <>
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [touch-action:pan-x_pan-y] pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {seasonalTours.map((tour) => (
                <Link to={`/tour-packages/${tour.id}`} key={`m-${tour.id}`} className="group shrink-0 snap-center w-[min(88vw,20.5rem)] bg-white rounded-2xl overflow-hidden shadow-md border border-border/50 flex flex-col">
                  <div className="relative h-56 overflow-hidden">
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
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{tour.title}</h3>
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
            <div className="hidden md:grid max-w-7xl mx-auto grid-cols-3 gap-6 sm:gap-10">
              {seasonalTours.map((tour) => (
                <Link to={`/tour-packages/${tour.id}`} key={tour.id} className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 flex flex-col border-0">
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
          </>
        )}
      </section>


      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-white">
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Handpicked Stays</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary px-2">Featured Hotels</h2>
          <p className="text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto font-light text-xs sm:text-sm px-2">
            Stay at the finest hotels and boutique resorts across Northern Pakistan, curated by our team.
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-md mx-auto md:hidden">Swipe to browse featured hotels.</p>
        </div>

        {isHotelsLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading hotels...</span>
            </div>
          </div>
        ) : hotels.length === 0 ? null : (
          <>
            {/* Mobile carousel */}
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [touch-action:pan-x_pan-y] pb-2 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {hotels.map((hotel) => (
                <Link
                  to={`/hotels/${hotel.id}`}
                  key={`m-${hotel.id}`}
                  className="group shrink-0 snap-center w-[min(88vw,20.5rem)] bg-white rounded-2xl overflow-hidden shadow-md border border-border/50 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url('${hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200"}')` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {hotel.category ? (
                      <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                        {hotel.category}
                      </div>
                    ) : null}
                    {hotel.rating && hotel.rating > 0 ? (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-sm text-xs font-bold text-lux-primary inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-lux-accent fill-lux-accent" />
                        {hotel.rating.toFixed(1)}
                      </div>
                    ) : null}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs font-medium drop-shadow-md">
                        <MapPin className="w-3 h-3 text-lux-accent" />
                        {hotel.location}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{hotel.description || "Premium accommodation curated for an unforgettable stay."}</p>
                    <div className="mt-auto pt-5 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">Starting From</span>
                        <span className="text-lg font-bold text-lux-primary">{hotel.priceFrom || "Contact us"}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop grid */}
            <div className={`hidden md:grid max-w-7xl mx-auto gap-6 sm:gap-8 ${hotels.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3"}`}>
              {hotels.map((hotel) => (
                <Link
                  to={`/hotels/${hotel.id}`}
                  key={hotel.id}
                  className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col border border-border/60 hover:-translate-y-1"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url('${hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200"}')` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {hotel.category ? (
                      <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                        {hotel.category}
                      </div>
                    ) : null}
                    {hotel.rating && hotel.rating > 0 ? (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-sm text-xs font-bold text-lux-primary inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-lux-accent fill-lux-accent" />
                        {hotel.rating.toFixed(1)}
                      </div>
                    ) : null}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs font-medium drop-shadow-md">
                        <MapPin className="w-3 h-3 text-lux-accent" />
                        {hotel.location}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{hotel.description || "Premium accommodation curated for an unforgettable stay."}</p>
                    <div className="mt-auto pt-5 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">Starting From</span>
                        <span className="text-base font-bold text-lux-primary">{hotel.priceFrom || "Contact us"}</span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Link
                to="/services/accommodation"
                className="border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-medium transition-colors cursor-pointer"
              >
                View All Hotels
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Featured Jeep Safaris */}
      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-lux-bg border-y border-border">
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Off-Road Expeditions</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary px-2">Featured Jeep Safaris</h2>
          <p className="text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto font-light text-xs sm:text-sm px-2">
            Hand-driven safaris through Deosai, Shimshal, Khunjerab, and beyond. Every trip curated by our team.
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-md mx-auto md:hidden">Swipe to browse featured safaris.</p>
        </div>

        {isSafarisLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading jeep safaris...</span>
            </div>
          </div>
        ) : safaris.length === 0 ? null : (
          <>
            {/* Mobile carousel */}
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [touch-action:pan-x_pan-y] pb-2 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {safaris.map((safari) => {
                const priceLabel = safari.pricePerPerson || safari.pricePerJeep || "";
                return (
                  <Link
                    to={`/jeep-safaris/${safari.id}`}
                    key={`m-${safari.id}`}
                    className="group shrink-0 snap-center w-[min(88vw,20.5rem)] bg-white rounded-2xl overflow-hidden shadow-md border border-border/50 flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                        style={{ backgroundImage: `url('${safari.image || "https://images.unsplash.com/photo-1597178454113-be25b884b8a4?auto=format&fit=crop&q=80&w=1200"}')` }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      {safari.category ? (
                        <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">{safari.category}</div>
                      ) : null}
                      {safari.difficulty ? (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-sm text-xs font-bold text-lux-primary">{safari.difficulty}</div>
                      ) : null}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-1.5 text-xs font-medium drop-shadow-md">
                          <MapPin className="w-3 h-3 text-lux-accent" />
                          {safari.region || "Northern Pakistan"}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{safari.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{safari.description || "Spectacular off-road expedition through untouched landscapes."}</p>
                      <div className="mt-auto pt-5 border-t border-border flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">{safari.duration || "From"}</span>
                          <span className="text-lg font-bold text-lux-primary">{priceLabel || "Contact us"}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {/* Desktop grid */}
            <div className={`hidden md:grid max-w-7xl mx-auto gap-6 sm:gap-8 ${safaris.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3"}`}>
              {safaris.map((safari) => {
                const priceLabel = safari.pricePerPerson || safari.pricePerJeep || "";
                return (
                  <Link
                    to={`/jeep-safaris/${safari.id}`}
                    key={safari.id}
                    className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col border border-border/60 hover:-translate-y-1"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                        style={{ backgroundImage: `url('${safari.image || "https://images.unsplash.com/photo-1597178454113-be25b884b8a4?auto=format&fit=crop&q=80&w=1200"}')` }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      {safari.category ? (
                        <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">{safari.category}</div>
                      ) : null}
                      {safari.difficulty ? (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-sm text-xs font-bold text-lux-primary">{safari.difficulty}</div>
                      ) : null}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-1.5 text-xs font-medium drop-shadow-md">
                          <MapPin className="w-3 h-3 text-lux-accent" />
                          {safari.region || "Northern Pakistan"}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{safari.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{safari.description || "Spectacular off-road expedition through untouched landscapes."}</p>
                      <div className="mt-auto pt-5 border-t border-border flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">{safari.duration || "From"}</span>
                          <span className="text-base font-bold text-lux-primary">{priceLabel || "Contact us"}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex justify-center mt-12">
              <Link
                to="/services/jeep-safari"
                className="border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-medium transition-colors cursor-pointer"
              >
                View All Jeep Safaris
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Featured Tour Guides */}
      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-white">
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Local Experts</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary px-2">Featured Tour Guides</h2>
          <p className="text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto font-light text-xs sm:text-sm px-2">
            Licensed local guides for trekking, cultural tours, and photography across Northern Pakistan.
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-md mx-auto md:hidden">Swipe to browse featured guides.</p>
        </div>

        {isGuidesLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading tour guides...</span>
            </div>
          </div>
        ) : guides.length === 0 ? null : (
          <>
            {/* Mobile carousel */}
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [touch-action:pan-x_pan-y] pb-2 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {guides.map((guide) => (
                <Link
                  to={`/tour-guides/${guide.id}`}
                  key={`m-${guide.id}`}
                  className="group shrink-0 snap-center w-[min(88vw,20.5rem)] bg-white rounded-2xl overflow-hidden shadow-md border border-border/50 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url('${guide.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200"}')` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {guide.category ? (
                      <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">{guide.category}</div>
                    ) : null}
                    {guide.rating && guide.rating > 0 ? (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-sm text-xs font-bold text-lux-primary inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-lux-accent fill-lux-accent" />
                        {guide.rating.toFixed(1)}
                      </div>
                    ) : null}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs font-medium drop-shadow-md">
                        <MapPin className="w-3 h-3 text-lux-accent" />
                        {guide.region || guide.baseCity || "Northern Pakistan"}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{guide.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{guide.shortBio || guide.bio || "Experienced local guide for unforgettable journeys."}</p>
                    <div className="mt-auto pt-5 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">{guide.experience || "Per Day"}</span>
                        <span className="text-lg font-bold text-lux-primary">{guide.pricePerDay || "Contact us"}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop grid */}
            <div className={`hidden md:grid max-w-7xl mx-auto gap-6 sm:gap-8 ${guides.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3"}`}>
              {guides.map((guide) => (
                <Link
                  to={`/tour-guides/${guide.id}`}
                  key={guide.id}
                  className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col border border-border/60 hover:-translate-y-1"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url('${guide.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200"}')` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {guide.category ? (
                      <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">{guide.category}</div>
                    ) : null}
                    {guide.rating && guide.rating > 0 ? (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-sm text-xs font-bold text-lux-primary inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-lux-accent fill-lux-accent" />
                        {guide.rating.toFixed(1)}
                      </div>
                    ) : null}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs font-medium drop-shadow-md">
                        <MapPin className="w-3 h-3 text-lux-accent" />
                        {guide.region || guide.baseCity || "Northern Pakistan"}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{guide.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{guide.shortBio || guide.bio || "Experienced local guide for unforgettable journeys."}</p>
                    <div className="mt-auto pt-5 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">{guide.experience || "Per Day"}</span>
                        <span className="text-base font-bold text-lux-primary">{guide.pricePerDay || "Contact us"}</span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Link
                to="/services/tour-guide"
                className="border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-medium transition-colors cursor-pointer"
              >
                View All Tour Guides
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Featured Rental Vehicles */}
      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-lux-bg border-y border-border">
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Premium Fleet</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary px-2">Featured Rentals</h2>
          <p className="text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto font-light text-xs sm:text-sm px-2">
            4x4 jeeps, luxury SUVs, and comfortable sedans for every road in Northern Pakistan.
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-md mx-auto md:hidden">Swipe to browse featured vehicles.</p>
        </div>

        {isRentalVehiclesLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading vehicles...</span>
            </div>
          </div>
        ) : rentalVehicles.length === 0 ? null : (
          <>
            {/* Mobile carousel */}
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [touch-action:pan-x_pan-y] pb-2 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {rentalVehicles.map((vehicle) => (
                <Link
                  to={`/rental-vehicles/${vehicle.id}`}
                  key={`m-${vehicle.id}`}
                  className="group shrink-0 snap-center w-[min(88vw,20.5rem)] bg-white rounded-2xl overflow-hidden shadow-md border border-border/50 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url('${vehicle.image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200"}')` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {vehicle.type ? (
                      <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">{vehicle.type}</div>
                    ) : null}
                    {vehicle.withDriver ? (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest text-lux-primary">+ Driver</div>
                    ) : null}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{vehicle.description || "Reliable vehicle for mountain roads and city travel."}</p>
                    <div className="mt-auto pt-5 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">{vehicle.seats ? `${vehicle.seats} · ${vehicle.transmission || "—"}` : "Per Day"}</span>
                        <span className="text-lg font-bold text-lux-primary">{vehicle.price || "Contact us"}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Desktop grid */}
            <div className={`hidden md:grid max-w-7xl mx-auto gap-6 sm:gap-8 ${rentalVehicles.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3"}`}>
              {rentalVehicles.map((vehicle) => (
                <Link
                  to={`/rental-vehicles/${vehicle.id}`}
                  key={vehicle.id}
                  className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col border border-border/60 hover:-translate-y-1"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url('${vehicle.image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200"}')` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    {vehicle.type ? (
                      <div className="absolute top-4 left-4 bg-lux-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">{vehicle.type}</div>
                    ) : null}
                    {vehicle.withDriver ? (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest text-lux-primary">+ Driver</div>
                    ) : null}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headings text-xl mb-2 group-hover:text-lux-accent transition-colors">{vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light leading-relaxed">{vehicle.description || "Reliable vehicle for mountain roads and city travel."}</p>
                    <div className="mt-auto pt-5 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">{vehicle.seats ? `${vehicle.seats} · ${vehicle.transmission || "—"}` : "Per Day"}</span>
                        <span className="text-base font-bold text-lux-primary">{vehicle.price || "Contact us"}</span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-lux-bg flex items-center justify-center group-hover:bg-lux-accent group-hover:text-white transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Link
                to="/services/car-rent"
                className="border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white px-8 py-3 rounded-sm text-sm uppercase tracking-widest font-medium transition-colors cursor-pointer"
              >
                View All Rentals
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-white">
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Why Choose Us</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary px-2">Travel with Confidence</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12">
          <div className="flex flex-row sm:flex-col items-start sm:items-center gap-4 sm:gap-0 bg-white/70 sm:bg-transparent rounded-2xl p-4 sm:p-0 border border-border/50 sm:border-0 shadow-sm sm:shadow-none">
            <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white flex items-center justify-center text-lux-accent shadow-sm">
              <Compass className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 text-left sm:text-center">
              <h3 className="font-headings text-lg sm:text-xl mb-1 sm:mb-3">Expert Guides</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Professional guides for an amazing experience.</p>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-start sm:items-center gap-4 sm:gap-0 bg-white/70 sm:bg-transparent rounded-2xl p-4 sm:p-0 border border-border/50 sm:border-0 shadow-sm sm:shadow-none">
            <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white flex items-center justify-center text-lux-accent shadow-sm">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 text-left sm:text-center">
              <h3 className="font-headings text-lg sm:text-xl mb-1 sm:mb-3">Best Price Guarantee</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Get the best prices for your dream trips.</p>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-start sm:items-center gap-4 sm:gap-0 bg-white/70 sm:bg-transparent rounded-2xl p-4 sm:p-0 border border-border/50 sm:border-0 shadow-sm sm:shadow-none">
            <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white flex items-center justify-center text-lux-accent shadow-sm">
              <Headset className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 text-left sm:text-center">
              <h3 className="font-headings text-lg sm:text-xl mb-1 sm:mb-3">24/7 Support</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">We are here to help you anytime, anywhere.</p>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-start sm:items-center gap-4 sm:gap-0 bg-white/70 sm:bg-transparent rounded-2xl p-4 sm:p-0 border border-border/50 sm:border-0 shadow-sm sm:shadow-none">
            <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white flex items-center justify-center text-lux-accent shadow-sm">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 text-left sm:text-center">
              <h3 className="font-headings text-lg sm:text-xl mb-1 sm:mb-3">Easy Booking</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Book your tour easily in just a few minutes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-lux-bg border-y border-border">
        <div className="text-center mb-10 sm:mb-16">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">Testimonials</div>
          <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary px-2">What Our Travelers Say</h2>
        </div>
        {isTestimonialsLoading ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
              <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
              <span className="text-sm">Loading testimonials...</span>
            </div>
          </div>
        ) : testimonials.length === 0 ? null : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t._id} className="border border-border p-6 sm:p-8 rounded-2xl sm:rounded-sm bg-lux-bg/50">
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

      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-lux-bg border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-16">
            <div>
              <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-2 sm:mb-3">From Our Blog</div>
              <h2 className="font-headings text-2xl sm:text-4xl text-lux-primary">Travel stories and planning guides</h2>
            </div>
            <Link to="/blogs" className="text-[10px] sm:text-xs uppercase tracking-[0.24em] font-bold text-lux-accent hover:text-lux-primary transition-colors">
              View all blogs
            </Link>
          </div>

          {isBlogsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
                <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
                <span className="text-sm">Loading blogs...</span>
              </div>
            </div>
          ) : blogs.length === 0 ? null : (
            <>
              <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [touch-action:pan-x_pan-y] pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {blogs.map((blog) => (
                  <Link
                    key={`m-${blog.id}`}
                    to={`/blogs/${blog.id}`}
                    className="group shrink-0 snap-center w-[min(88vw,20.5rem)] overflow-hidden rounded-2xl bg-white border border-border shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className="h-52 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url('${blog.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1200"}')` }}
                    />
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-accent mb-3">
                        <Tag className="w-3.5 h-3.5" />
                        {blog.category || "Blog"}
                      </div>
                      <h3 className="font-headings text-xl text-lux-primary mb-3 leading-snug group-hover:text-lux-accent transition-colors">
                        {blog.title}
                      </h3>
                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3 text-[11px] text-lux-primary/55">
                        <span className="truncate">{blog.author || "North Paradise Team"}</span>
                        <span className="inline-flex items-center gap-1.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-lux-accent" />
                          {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    to={`/blogs/${blog.id}`}
                    className="group overflow-hidden rounded-sm bg-white border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div
                      className="h-52 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url('${blog.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1200"}')` }}
                    />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-accent mb-3">
                        <Tag className="w-3.5 h-3.5" />
                        {blog.category || "Blog"}
                      </div>
                      <h3 className="font-headings text-xl text-lux-primary mb-3 leading-snug group-hover:text-lux-accent transition-colors">
                        {blog.title}
                      </h3>
                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3 text-[11px] text-lux-primary/55">
                        <span className="truncate">{blog.author || "North Paradise Team"}</span>
                        <span className="inline-flex items-center gap-1.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-lux-accent" />
                          {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-lux-bg flex justify-center pb-24 sm:pb-32">
        <div className="max-w-5xl mx-auto w-full relative overflow-hidden rounded-2xl sm:rounded-sm min-h-[320px] sm:h-[400px] h-auto flex items-center justify-center py-14 sm:py-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?auto=format&fit=crop&q=80&w=2000')" }}></div>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 text-center text-white px-5 sm:px-8 max-w-lg sm:max-w-none mx-auto">
            <h2 className="font-headings text-2xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight">Let's make your next journey unforgettable</h2>
            <p className="text-sm sm:text-lg opacity-90 mb-8 sm:mb-10 max-w-xl mx-auto font-light">
              Discover the world with our exclusive tour packages and special offers.
            </p>
            <Link to="/request-quote" className="bg-lux-accent hover:bg-lux-accent/90 text-white font-bold tracking-widest uppercase text-xs sm:text-sm px-8 sm:px-10 py-3.5 sm:py-4 rounded-full sm:rounded-sm transition-colors cursor-pointer inline-flex items-center touch-manipulation">
              Plan Your Tour
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
