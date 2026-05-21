import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  X as XIcon,
  LoaderCircle,
  Clock,
  Compass,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";
import { getApiUrl, parseJsonSafely } from "../lib/api";
import { whatsAppUrl } from "../lib/site";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

type ItineraryStep = { day?: string; title: string; description?: string };

type JeepSafari = {
  id: string;
  name: string;
  region?: string;
  duration?: string;
  pricePerPerson?: string;
  pricePerJeep?: string;
  image?: string;
  gallery?: string[];
  description?: string;
  category?: string;
  difficulty?: string;
  vehicleType?: string;
  maxGroupSize?: string;
  bestSeason?: string;
  startLocation?: string;
  endLocation?: string;
  meetingPoint?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  itinerary?: ItineraryStep[];
  nearbyAttractions?: string[];
};

function normalizeSafari(input: unknown): JeepSafari | null {
  if (!input || typeof input !== "object") return null;
  const s = input as JeepSafari;
  if (!s.id || !s.name) return null;
  return {
    id: s.id,
    name: s.name,
    region: s.region || "",
    duration: s.duration || "",
    pricePerPerson: s.pricePerPerson || "",
    pricePerJeep: s.pricePerJeep || "",
    image: s.image || "",
    gallery: Array.isArray(s.gallery) ? s.gallery : [],
    description: s.description || "",
    category: s.category || "",
    difficulty: s.difficulty || "",
    vehicleType: s.vehicleType || "",
    maxGroupSize: s.maxGroupSize || "",
    bestSeason: s.bestSeason || "",
    startLocation: s.startLocation || "",
    endLocation: s.endLocation || "",
    meetingPoint: s.meetingPoint || "",
    highlights: Array.isArray(s.highlights) ? s.highlights : [],
    includes: Array.isArray(s.includes) ? s.includes : [],
    excludes: Array.isArray(s.excludes) ? s.excludes : [],
    itinerary: Array.isArray(s.itinerary) ? s.itinerary : [],
    nearbyAttractions: Array.isArray(s.nearbyAttractions) ? s.nearbyAttractions : [],
  };
}

function buildSafariEnquiryMessage(safari: JeepSafari) {
  const lines: string[] = [];
  lines.push("Assalamu Alaikum! I'm interested in booking this Jeep Safari:");
  lines.push("");
  lines.push(`🚙 *Safari:* ${safari.name}`);
  if (safari.region) lines.push(`📍 *Region:* ${safari.region}`);
  if (safari.category) lines.push(`✨ *Category:* ${safari.category}`);
  if (safari.duration) lines.push(`⏱️ *Duration:* ${safari.duration}`);
  if (safari.difficulty) lines.push(`🏔️ *Difficulty:* ${safari.difficulty}`);
  if (safari.vehicleType) lines.push(`🚗 *Vehicle:* ${safari.vehicleType}`);
  if (safari.pricePerPerson) lines.push(`💰 *Price Per Person:* ${safari.pricePerPerson}`);
  if (safari.pricePerJeep) lines.push(`💰 *Price Per Jeep:* ${safari.pricePerJeep}`);
  if (safari.meetingPoint) lines.push(`📌 *Meeting Point:* ${safari.meetingPoint}`);
  lines.push("");
  lines.push("*Could you please help me with:*");
  lines.push("1️⃣ Is this safari available on my preferred dates?");
  lines.push("2️⃣ What is the total cost for my group?");
  lines.push("3️⃣ Is fuel, driver, and park entry included?");
  lines.push("4️⃣ What should I bring / wear for this trip?");
  lines.push("5️⃣ Do you offer hotel pickup from Skardu / Gilgit?");
  lines.push("6️⃣ What is the cancellation policy?");
  lines.push("");
  lines.push("*My preferred dates:* _(please share)_");
  lines.push("*Number of travellers:* _(please share)_");
  return lines.join("\n");
}

export default function JeepSafariDetail() {
  const { id } = useParams();
  const [safari, setSafari] = useState<JeepSafari | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Safari not found.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(getApiUrl(`/api/jeep-safaris/${id}`));
        const data = await parseJsonSafely(response);
        if (!response.ok) {
          setError(data?.message || "Failed to load safari.");
          setSafari(null);
          return;
        }
        const normalized = normalizeSafari(data?.data);
        if (!normalized) {
          setError("Safari not found.");
          setSafari(null);
          return;
        }
        setSafari(normalized);
      } catch {
        setError("Unable to load safari details.");
        setSafari(null);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
          <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
          <span className="text-sm">Loading safari...</span>
        </div>
      </div>
    );
  }

  if (!safari) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-headings text-4xl mb-4">Safari Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "This safari could not be found."}</p>
        <Link to="/services/jeep-safari" className="text-lux-accent hover:underline">
          Return to Jeep Safaris
        </Link>
      </div>
    );
  }

  const gallery =
    safari.gallery && safari.gallery.length > 0
      ? safari.gallery
      : safari.image
        ? [safari.image]
        : [];

  const nextImage = () => {
    if (gallery.length === 0) return;
    setGalleryIndex((prev) => (prev + 1) % gallery.length);
  };
  const prevImage = () => {
    if (gallery.length === 0) return;
    setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const waMessage = buildSafariEnquiryMessage(safari);

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO
        title={`${safari.name} | Jeep Safari | Northern Pakistan`}
        description={(safari.description || "Off-road jeep safari in Northern Pakistan.").slice(0, 160)}
        keywords={`${safari.name}, jeep safari, ${safari.region}, Northern Pakistan safari`}
        image={safari.image}
      />
      <Navbar />

      <section
        className="relative h-[min(48vh,22rem)] sm:h-[60vh] min-h-[320px] sm:min-h-[500px] flex items-end pb-8 sm:pb-16 bg-cover bg-center pt-20 sm:pt-0"
        style={{
          backgroundImage: `url('${
            safari.image ||
            "https://images.unsplash.com/photo-1597178454113-be25b884b8a4?auto=format&fit=crop&q=80&w=2000"
          }')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="relative z-10 text-white px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
          <Link
            to="/services/jeep-safari"
            className="inline-flex items-center text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-6 hover:text-lux-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Jeep Safaris
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="min-w-0">
              {safari.category ? (
                <p className="text-lux-accent text-xs sm:text-sm uppercase tracking-widest mb-2 font-bold">
                  {safari.category}
                </p>
              ) : null}
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-2 leading-[1.08]">
                {safari.name}
              </h1>
              <div className="flex items-center gap-2 text-sm sm:text-base text-white/90">
                <MapPin className="w-4 h-4 text-lux-accent" />
                {safari.region || "Northern Pakistan"}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-l-0 sm:border-l border-white/20 pl-0 sm:pl-6">
              {safari.duration ? (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Duration</p>
                  <p className="font-medium text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4 text-lux-accent" /> {safari.duration}
                  </p>
                </div>
              ) : null}
              {safari.pricePerPerson || safari.pricePerJeep ? (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">From</p>
                  <p className="font-medium text-lg">
                    {safari.pricePerPerson || safari.pricePerJeep}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2 space-y-10">
            {gallery.length > 0 && (
              <div className="relative overflow-hidden rounded-sm aspect-[16/9] bg-lux-primary/5">
                <img
                  src={gallery[galleryIndex]}
                  alt={safari.name}
                  className="w-full h-full object-cover"
                />
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {safari.description ? (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-4">About This Safari</h2>
                <p className="text-muted-foreground leading-relaxed font-light whitespace-pre-line">
                  {safari.description}
                </p>
              </div>
            ) : null}

            {safari.highlights && safari.highlights.length > 0 && (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-lux-accent" /> Highlights
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {safari.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-lux-accent shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {safari.itinerary && safari.itinerary.length > 0 && (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-6">Itinerary</h2>
                <div className="space-y-4">
                  {safari.itinerary.map((step, idx) => (
                    <div
                      key={`${step.title}-${idx}`}
                      className="border border-border bg-white p-5 sm:p-6"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {step.day ? (
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-lux-accent bg-lux-accent/10 px-2.5 py-1">
                            {step.day}
                          </span>
                        ) : null}
                        <h3 className="font-headings text-lg">{step.title}</h3>
                      </div>
                      {step.description ? (
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                          {step.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-8">
              {safari.includes && safari.includes.length > 0 && (
                <div>
                  <h3 className="font-headings text-xl mb-4">Included</h3>
                  <ul className="space-y-2">
                    {safari.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {safari.excludes && safari.excludes.length > 0 && (
                <div>
                  <h3 className="font-headings text-xl mb-4">Not Included</h3>
                  <ul className="space-y-2">
                    {safari.excludes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {safari.nearbyAttractions && safari.nearbyAttractions.length > 0 && (
              <div>
                <h2 className="font-headings text-2xl mb-4">Nearby Attractions</h2>
                <div className="flex flex-wrap gap-2">
                  {safari.nearbyAttractions.map((a) => (
                    <span
                      key={a}
                      className="text-xs uppercase tracking-widest border border-border px-3 py-1.5 text-muted-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-border p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-headings text-xl">Trip Details</h3>
              <dl className="space-y-4 text-sm">
                {safari.difficulty ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground">Difficulty</dt>
                    <dd className="font-medium text-right">{safari.difficulty}</dd>
                  </div>
                ) : null}
                {safari.vehicleType ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-lux-accent" /> Vehicle
                    </dt>
                    <dd className="font-medium text-right">{safari.vehicleType}</dd>
                  </div>
                ) : null}
                {safari.maxGroupSize ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-lux-accent" /> Group Size
                    </dt>
                    <dd className="font-medium text-right">{safari.maxGroupSize}</dd>
                  </div>
                ) : null}
                {safari.bestSeason ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-lux-accent" /> Best Season
                    </dt>
                    <dd className="font-medium text-right">{safari.bestSeason}</dd>
                  </div>
                ) : null}
                {safari.startLocation ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground">Start</dt>
                    <dd className="font-medium text-right">{safari.startLocation}</dd>
                  </div>
                ) : null}
                {safari.endLocation ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground">End</dt>
                    <dd className="font-medium text-right">{safari.endLocation}</dd>
                  </div>
                ) : null}
                {safari.meetingPoint ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Meeting Point</dt>
                    <dd className="font-medium text-right">{safari.meetingPoint}</dd>
                  </div>
                ) : null}
              </dl>

              {safari.pricePerPerson ? (
                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Per Person
                  </p>
                  <p className="font-headings text-2xl text-lux-primary">{safari.pricePerPerson}</p>
                </div>
              ) : null}
              {safari.pricePerJeep ? (
                <div className={safari.pricePerPerson ? "" : "pt-4 border-t border-border"}>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Per Jeep
                  </p>
                  <p className="font-headings text-2xl text-lux-primary">{safari.pricePerJeep}</p>
                </div>
              ) : null}

              <a
                href={whatsAppUrl(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-lux-primary text-white px-6 py-3 rounded-sm text-xs uppercase tracking-[0.22em] font-bold hover:bg-lux-accent transition-colors"
              >
                Book on WhatsApp
              </a>
              <Link
                to={`/request-quote?service=Jeep+Safari&trip=${encodeURIComponent(safari.name)}`}
                className="block text-center border border-lux-primary/20 text-lux-primary px-6 py-3 rounded-sm text-xs uppercase tracking-[0.22em] font-bold hover:border-lux-accent hover:text-lux-accent transition-colors"
              >
                Request a Quote
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
