import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Clock, Check, MapPin, CalendarDays, Star, Info, LoaderCircle, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

type ItineraryDay = {
  day: string;
  title: string;
  description: string;
};

type TourTier = {
  tier: string;
  price: string;
  description: string;
};

type TourPackage = {
  id: string;
  title: string;
  destinations: string[];
  duration: string;
  price: string;
  image: string;
  type: string;
  description: string;
  itinerary: ItineraryDay[];
  tourPackages: TourTier[];
  gallery?: string[];
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
    itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
    tourPackages: Array.isArray(t.tourPackages) ? t.tourPackages : [],
    gallery: Array.isArray(t.gallery) ? t.gallery : [],
  };
}

const WA_URL = "https://wa.me/923488142776";

const defaultIncluded = [
  "Luxury Accommodations",
  "Private Airport Transfers",
  "Expert Local Guides",
  "Daily Breakfast & Select Meals",
  "Exclusive Access Experiences",
  "24/7 Concierge Support",
];

export default function TourPackageDetail() {
  const { id } = useParams();
  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTier, setSelectedTier] = useState("");


  useEffect(() => {
    const loadPackage = async () => {
      if (!id) {
        setError("Tour package not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(getApiUrl(`/api/tour-packages/${id}`));
        const data = await parseJsonSafely(response);

        if (!response.ok) {
          setError(data?.message || "Failed to load tour package.");
          setPkg(null);
          return;
        }

        const normalized = normalizeTourPackage(data?.data);
        if (!normalized) {
          setError("Tour package not found.");
          setPkg(null);
          return;
        }

        setPkg(normalized);
        setSelectedTier(normalized.tourPackages?.[0]?.tier || "");
      } catch {
        setError("Unable to load tour package details.");
        setPkg(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPackage();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
          <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
          <span className="text-sm">Loading tour package...</span>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-headings text-4xl mb-4">Tour Package Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "This tour package could not be found."}</p>
        <Link to="/tour-packages" className="text-lux-accent hover:underline">
          Return to Tour Packages
        </Link>
      </div>
    );
  }

  const currentTierData = pkg.tourPackages.find((t) => t.tier === selectedTier) || pkg.tourPackages[0];

  const waMessage = pkg
    ? encodeURIComponent(
      `Hi, I'm interested in the *${pkg.title}* tour package.${currentTierData ? ` (${currentTierData.tier} tier — ${currentTierData.price})` : pkg.price ? ` Starting from ${pkg.price}` : ''
      }${pkg.destinations.length > 0 ? `\nDestinations: ${pkg.destinations.join(' → ')}` : ''}${pkg.duration ? `\nDuration: ${pkg.duration}` : ''}\n\nPlease send me the full itinerary and available dates.`
    )
    : encodeURIComponent('Hi, I would like to inquire about a tour package.');

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO 
        title={`${pkg.title} | ${pkg.duration} Tour Package`}
        description={pkg.description || `Book the ${pkg.title} tour package for an unforgettable experience in Northern Pakistan. ${pkg.duration} journey covering ${pkg.destinations.join(", ")}.`}
        keywords={`${pkg.title}, Pakistan tour package, ${pkg.type} tour, ${pkg.destinations.join(", ")}, Northern Pakistan trip`}
        image={pkg.image}
      />
      <Navbar />


      <section
        className="relative h-[min(42vh,20rem)] sm:h-[60vh] min-h-[280px] sm:min-h-[500px] flex items-end pb-8 sm:pb-16 bg-cover bg-center pt-20 sm:pt-0"
        style={{ backgroundImage: `url('${pkg.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2000"}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        <div className="relative z-10 text-white px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
          <Link to="/tour-packages" className="inline-flex items-center text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-6 hover:text-lux-accent transition-colors drop-shadow-md">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tour Packages
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="min-w-0">
              {pkg.type ? (
                <p className="text-lux-accent text-xs sm:text-sm uppercase tracking-widest mb-2 font-medium drop-shadow-md">
                  {pkg.type}
                </p>
              ) : null}
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-7xl mb-2 drop-shadow-md leading-[1.08]">{pkg.title}</h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-l-0 sm:border-l border-white/20 pl-0 sm:pl-6 w-full sm:w-auto drop-shadow-md">
              {pkg.duration ? (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Duration</p>
                  <p className="font-medium text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4 text-lux-accent" /> {pkg.duration}
                  </p>
                </div>
              ) : null}
              {pkg.price ? (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Starting Price</p>
                  <p className="font-medium text-lg">
                    {pkg.price.replace("From ", "")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-16">
          <div className="lg:col-span-2">
            <h2 className="font-headings text-3xl mb-6">Package Overview</h2>
            <p className="text-lg leading-relaxed text-muted-foreground font-light mb-12">
              {pkg.description || "Details coming soon."}
            </p>

            {pkg.destinations.length > 0 ? (
              <>
                <h3 className="font-headings text-2xl mb-6">Destinations Explored</h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-12">
                  {pkg.destinations.map((dest, idx) => (
                    <div key={idx} className="flex items-center flex-wrap">
                      <MapPin className="w-4 h-4 text-lux-accent mr-1 shrink-0" />
                      <span className="font-medium opacity-90 text-sm sm:text-base">{dest}</span>
                      {idx < pkg.destinations.length - 1 && (
                        <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 mx-2 sm:ml-4 border-0 sm:border-l border-border sm:pl-2 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {pkg.gallery && pkg.gallery.length > 0 ? (
              <>
                <h3 className="font-headings text-2xl mb-6">Experience in Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                  {pkg.gallery.map((img, idx) => (
                    <div key={idx} className={`relative overflow-hidden rounded-sm bg-lux-bg transition-all duration-500 hover:z-10 hover:scale-[1.02] cursor-pointer shadow-sm ${idx === 0 ? "md:col-span-2 md:row-span-2 aspect-video md:aspect-auto" : "aspect-square"}`}>
                      <img src={img} alt={`${pkg.title} gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {pkg.itinerary.length > 0 ? (
              <>
                <h3 className="font-headings text-2xl mb-6">Day-by-Day Itinerary</h3>
                <div className="space-y-6 mb-12">
                  {pkg.itinerary.map((dayPlan, idx) => (
                    <div key={idx} className="flex gap-4 sm:gap-6 bg-white p-6 border border-border rounded-sm">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-12 h-12 bg-lux-bg flex items-center justify-center rounded-full border border-border mb-2 text-lux-accent">
                          <CalendarDays className="w-5 h-5" />
                        </div>
                        <div className="w-px h-full bg-border mt-2"></div>
                      </div>
                      <div>
                        <div className="text-sm text-lux-accent font-medium uppercase tracking-widest mb-1">{dayPlan.day}</div>
                        <h4 className="font-headings text-xl mb-3">{dayPlan.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{dayPlan.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <h3 className="font-headings text-2xl mb-6">What's Included</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {defaultIncluded.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 border border-border rounded-sm">
                  <div className="mt-1 bg-lux-bg p-1 rounded-full text-lux-accent shrink-0 border border-border">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white border border-border rounded-2xl sm:rounded-sm static lg:sticky lg:top-28 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-lux-primary text-white p-6">
                <h3 className="font-headings text-2xl mb-1">Reserve Your Space</h3>
                <p className="text-white/70 text-sm">Select your preferred tour package tier.</p>
              </div>

              <div className="p-6 flex-1">
                {pkg.tourPackages.length > 0 ? (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
                      Select Package Tier
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {pkg.tourPackages.map((tierData) => (
                        <button
                          key={tierData.tier}
                          onClick={() => setSelectedTier(tierData.tier)}
                          className={`py-3 px-2 flex flex-col items-center justify-center rounded-sm border transition-all text-sm uppercase tracking-wider cursor-pointer ${selectedTier === tierData.tier ? "border-lux-accent bg-lux-accent/5 text-lux-primary" : "border-border text-muted-foreground hover:border-lux-primary"}`}
                        >
                          {tierData.tier === "Elite" && <Star className="w-4 h-4 mb-1 text-lux-accent" />}
                          {tierData.tier}
                        </button>
                      ))}
                    </div>

                    {currentTierData ? (
                      <div className="bg-lux-bg p-4 rounded-sm border border-border animate-in fade-in duration-300">
                        <div className="flex items-start gap-2 mb-2">
                          <Info className="w-4 h-4 text-lux-accent shrink-0 mt-0.5" />
                          <h4 className="font-medium">The {currentTierData.tier} Experience</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-6 mb-4">
                          {currentTierData.description}
                        </p>
                        <div className="text-right border-t border-border pt-4">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Package Price</span>
                          <span className="font-headings text-2xl text-lux-accent">{currentTierData.price}</span>
                          <span className="text-xs text-muted-foreground block">per person</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-4 mb-8">
                  {pkg.type ? (
                    <div className="flex justify-between pb-4 border-b border-border">
                      <span className="text-muted-foreground">Package Type</span>
                      <span className="font-medium text-right">{pkg.type}</span>
                    </div>
                  ) : null}
                  {pkg.duration ? (
                    <div className="flex justify-between pb-4 border-b border-border">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-right">{pkg.duration}</span>
                    </div>
                  ) : null}
                  {pkg.destinations.length > 0 ? (
                    <div className="flex flex-col gap-1 pb-4 border-b border-border">
                      <span className="text-muted-foreground">Route</span>
                      <span className="font-medium text-right text-sm leading-relaxed">{pkg.destinations.join(" → ")}</span>
                    </div>
                  ) : null}
                </div>

                <Link to="/request-quote" className="w-full bg-lux-accent text-white px-6 py-4 rounded-sm uppercase tracking-wider hover:bg-lux-primary transition-colors font-medium cursor-pointer text-center block">
                  Book This Tour
                </Link>
                <a href={`https://wa.me/923488142776?text=${waMessage}`} target="_blank" rel="noreferrer" className="w-full mt-3 border border-lux-primary text-lux-primary px-6 py-4 rounded-sm uppercase tracking-wider hover:bg-lux-bg transition-colors font-medium cursor-pointer text-center block">
                  Talk to an Advisor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
