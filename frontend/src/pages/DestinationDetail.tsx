import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MapPin, ChevronLeft, ChevronRight, Calendar, Clock, Check, Utensils, Lightbulb, LoaderCircle } from "lucide-react";

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

export default function DestinationDetail() {
  const { id } = useParams();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadDestination = async () => {
      if (!id) {
        setError("Destination not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(getApiUrl(`/api/destinations/${id}`));
        const data = await parseJsonSafely(response);

        if (!response.ok) {
          setError(data?.message || "Failed to load destination.");
          setDestination(null);
          return;
        }

        const normalizedDestination = normalizeDestination(data?.data);
        if (!normalizedDestination) {
          setError("Destination not found.");
          setDestination(null);
          return;
        }

        setDestination(normalizedDestination);
      } catch {
        setError("Unable to load destination details.");
        setDestination(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDestination();
  }, [id]);

  const nextImage = () => {
    if (destination?.gallery?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % destination.gallery!.length);
    }
  };

  const prevImage = () => {
    if (destination?.gallery?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + destination.gallery!.length) % destination.gallery!.length);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
          <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
          <span className="text-sm">Loading destination...</span>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-headings text-4xl mb-4">Destination Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "This destination could not be found."}</p>
        <Link to="/destinations" className="text-lux-accent hover:underline">
          Return to Destinations
        </Link>
      </div>
    );
  }

  const gallery = destination.gallery && destination.gallery.length > 0
    ? destination.gallery
    : destination.image
      ? [destination.image]
      : [];

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col pt-16">
      <Navbar />

      <section
        className="relative h-[60vh] min-h-[500px] flex items-end pb-16 bg-cover bg-center"
        style={{ backgroundImage: `url('${destination.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000"}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        <div className="relative z-10 text-white px-6 sm:px-12 max-w-7xl mx-auto w-full">
          <Link to="/destinations" className="inline-flex items-center text-sm uppercase tracking-wider mb-6 hover:text-lux-accent transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Destinations
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-lux-accent text-sm uppercase tracking-widest mb-2 flex items-center gap-1 font-medium">
                <MapPin className="w-4 h-4" />
                {destination.location}
              </p>
              <h1 className="font-headings text-5xl sm:text-7xl mb-2">
                {destination.name}
              </h1>
            </div>
            <div className="flex gap-6 border-l border-white/20 pl-6">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Duration</p>
                <p className="font-medium text-lg flex items-center gap-2"><Clock className="w-4 h-4 text-lux-accent" /> {destination.duration || "Custom"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Starting Price</p>
                <p className="font-medium text-lg">{(destination.price || "Contact us").replace('From ', '')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h2 className="font-headings text-3xl mb-6">About {destination.name}</h2>
            <p className="text-lg leading-relaxed text-muted-foreground font-light mb-12">
              {destination.description || "Destination details will be available soon."}
            </p>

            <h3 className="font-headings text-2xl mb-6">Journey Highlights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {(destination.highlights || []).length > 0 ? (
                destination.highlights!.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-4 border border-border rounded-sm">
                    <div className="mt-1 bg-lux-bg p-1 rounded-full text-lux-accent">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="font-medium">{highlight}</span>
                  </div>
                ))
              ) : (
                <div className="bg-white p-4 border border-border rounded-sm text-muted-foreground">
                  Highlights will be added soon.
                </div>
              )}
            </div>

            <h3 className="font-headings text-2xl mb-6">The Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {destination.cuisine ? (
                <div className="bg-white p-6 border border-border rounded-sm flex flex-col gap-3">
                  <div className="bg-lux-bg w-10 h-10 rounded-full flex items-center justify-center text-lux-accent mb-2 shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <h4 className="font-headings text-xl">Local Flavors</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{destination.cuisine}</p>
                </div>
              ) : null}
              {destination.whenToGo ? (
                <div className="bg-white p-6 border border-border rounded-sm flex flex-col gap-3">
                  <div className="bg-lux-bg w-10 h-10 rounded-full flex items-center justify-center text-lux-accent mb-2 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="font-headings text-xl">When to Visit</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{destination.whenToGo}</p>
                </div>
              ) : null}
            </div>

            {destination.expertTip ? (
              <div className="bg-lux-primary text-white p-8 md:p-10 rounded-sm mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Lightbulb className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex gap-4 md:gap-6 flex-col md:flex-row items-start">
                  <div className="bg-white/10 p-3 rounded-full shrink-0">
                    <Lightbulb className="w-6 h-6 text-lux-accent" />
                  </div>
                  <div>
                    <h4 className="text-lux-accent text-sm uppercase tracking-widest font-medium mb-3">Expert Travel Tip</h4>
                    <p className="text-lg md:text-xl font-light leading-relaxed italic">
                      "{destination.expertTip}"
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {gallery.length > 0 ? (
              <div className="mb-12">
                <h3 className="font-headings text-2xl mb-6">Gallery</h3>
                <div className="relative group rounded-sm overflow-hidden bg-gray-100 aspect-video">
                  <img
                    src={gallery[currentImageIndex]}
                    alt={`${destination.name} - image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />

                  {gallery.length > 1 ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={prevImage}
                          className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {gallery.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <div className="bg-white border border-border p-8 rounded-sm sticky top-24 shadow-sm">
              <h3 className="font-headings text-2xl mb-2">Plan Your Voyage</h3>
              <p className="text-muted-foreground text-sm mb-6">Discover the magic of {destination.name} with our curated selection of {(destination.tours || "available tours").toLowerCase()}.</p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Tours Available</span>
                  <span className="font-medium">{destination.tours || "Available"}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Best Time to Visit</span>
                  <span className="font-medium">{destination.whenToGo || "Year-round"}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Activity Level</span>
                  <span className="font-medium">Moderate</span>
                </div>
              </div>

              <Link to="/request-quote" className="w-full bg-lux-accent text-white px-6 py-4 rounded-sm uppercase tracking-wider hover:bg-lux-accent/90 transition-colors font-medium text-center block">
                View Available Dates
              </Link>
              <a href={WA_URL} target="_blank" rel="noreferrer" className="w-full mt-3 border border-lux-primary text-lux-primary px-6 py-4 rounded-sm uppercase tracking-wider hover:bg-lux-bg transition-colors font-medium text-center block">
                Talk to an Advisor
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
