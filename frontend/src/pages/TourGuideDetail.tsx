import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  LoaderCircle,
  Briefcase,
  Languages,
  Award,
  Phone,
  Mail,
} from "lucide-react";
import { getApiUrl, parseJsonSafely } from "../lib/api";
import { whatsAppUrl } from "../lib/site";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

type TourGuide = {
  id: string;
  name: string;
  image?: string;
  gallery?: string[];
  shortBio?: string;
  bio?: string;
  experience?: string;
  pricePerDay?: string;
  languages?: string[];
  specialties?: string[];
  category?: string;
  region?: string;
  baseCity?: string;
  certifications?: string[];
  rating?: number;
  totalTrips?: number;
  phoneNumber?: string;
  email?: string;
  whatsapp?: string;
  available?: boolean;
};

function normalizeGuide(input: unknown): TourGuide | null {
  if (!input || typeof input !== "object") return null;
  const g = input as TourGuide;
  if (!g.id || !g.name) return null;
  return {
    id: g.id,
    name: g.name,
    image: g.image || "",
    gallery: Array.isArray(g.gallery) ? g.gallery : [],
    shortBio: g.shortBio || "",
    bio: g.bio || "",
    experience: g.experience || "",
    pricePerDay: g.pricePerDay || "",
    languages: Array.isArray(g.languages) ? g.languages : [],
    specialties: Array.isArray(g.specialties) ? g.specialties : [],
    category: g.category || "",
    region: g.region || "",
    baseCity: g.baseCity || "",
    certifications: Array.isArray(g.certifications) ? g.certifications : [],
    rating: Number.isFinite(Number(g.rating)) ? Number(g.rating) : 0,
    totalTrips: Number.isFinite(Number(g.totalTrips)) ? Number(g.totalTrips) : 0,
    phoneNumber: g.phoneNumber || "",
    email: g.email || "",
    whatsapp: g.whatsapp || "",
    available: g.available !== false,
  };
}

function buildGuideEnquiryMessage(guide: TourGuide) {
  const lines: string[] = [];
  lines.push("Assalamu Alaikum! I'd like to hire a tour guide:");
  lines.push("");
  lines.push(`👤 *Guide:* ${guide.name}`);
  if (guide.category) lines.push(`✨ *Specialty:* ${guide.category}`);
  if (guide.region || guide.baseCity)
    lines.push(`📍 *Region:* ${guide.region || guide.baseCity}`);
  if (guide.experience) lines.push(`🏔️ *Experience:* ${guide.experience}`);
  if (guide.pricePerDay) lines.push(`💰 *Rate:* ${guide.pricePerDay} / day`);
  if (guide.rating && guide.rating > 0)
    lines.push(`⭐ *Rating:* ${guide.rating.toFixed(1)} / 5`);
  if (guide.languages && guide.languages.length > 0)
    lines.push(`🗣️ *Languages:* ${guide.languages.join(", ")}`);
  if (guide.specialties && guide.specialties.length > 0)
    lines.push(`🎯 *Specialties:* ${guide.specialties.join(", ")}`);
  lines.push("");
  lines.push("*Could you please help me with:*");
  lines.push("1️⃣ Is this guide available on my preferred dates?");
  lines.push("2️⃣ What is the total cost for my trip duration?");
  lines.push("3️⃣ Does the rate include transport or just guiding?");
  lines.push("4️⃣ Can the guide customize the itinerary for my group?");
  lines.push("5️⃣ What trekking / cultural sites can we cover?");
  lines.push("6️⃣ What is the cancellation policy?");
  lines.push("");
  lines.push("*My preferred dates:* _(please share)_");
  lines.push("*Trip duration / destinations:* _(please share)_");
  lines.push("*Number of travellers:* _(please share)_");
  return lines.join("\n");
}

export default function TourGuideDetail() {
  const { id } = useParams();
  const [guide, setGuide] = useState<TourGuide | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Guide not found.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(getApiUrl(`/api/tour-guides/${id}`));
        const data = await parseJsonSafely(response);
        if (!response.ok) {
          setError(data?.message || "Failed to load guide.");
          setGuide(null);
          return;
        }
        const normalized = normalizeGuide(data?.data);
        if (!normalized) {
          setError("Guide not found.");
          setGuide(null);
          return;
        }
        setGuide(normalized);
      } catch {
        setError("Unable to load guide details.");
        setGuide(null);
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
          <span className="text-sm">Loading guide...</span>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-headings text-4xl mb-4">Guide Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "This guide could not be found."}</p>
        <Link to="/services/tour-guide" className="text-lux-accent hover:underline">
          Return to Tour Guides
        </Link>
      </div>
    );
  }

  const gallery =
    guide.gallery && guide.gallery.length > 0
      ? guide.gallery
      : guide.image
        ? [guide.image]
        : [];

  const waMessage = buildGuideEnquiryMessage(guide);

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO
        title={`${guide.name} | Tour Guide | Northern Pakistan`}
        description={(guide.shortBio || guide.bio || "Licensed tour guide in Northern Pakistan.").slice(
          0,
          160
        )}
        keywords={`${guide.name}, tour guide, ${guide.region}, Northern Pakistan guide`}
        image={guide.image}
      />
      <Navbar />

      <section
        className="relative h-[min(48vh,22rem)] sm:h-[60vh] min-h-[320px] sm:min-h-[500px] flex items-end pb-8 sm:pb-16 bg-cover bg-center pt-20 sm:pt-0"
        style={{
          backgroundImage: `url('${
            guide.image ||
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=2000"
          }')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="relative z-10 text-white px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
          <Link
            to="/services/tour-guide"
            className="inline-flex items-center text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-6 hover:text-lux-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tour Guides
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="min-w-0">
              {guide.category ? (
                <p className="text-lux-accent text-xs sm:text-sm uppercase tracking-widest mb-2 font-bold">
                  {guide.category}
                </p>
              ) : null}
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-2 leading-[1.08]">
                {guide.name}
              </h1>
              <div className="flex items-center gap-2 text-sm sm:text-base text-white/90">
                <MapPin className="w-4 h-4 text-lux-accent" />
                {guide.region || guide.baseCity || "Northern Pakistan"}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-l-0 sm:border-l border-white/20 pl-0 sm:pl-6">
              {guide.rating && guide.rating > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Rating</p>
                  <p className="font-medium text-lg flex items-center gap-2">
                    <Star className="w-4 h-4 text-lux-accent fill-lux-accent" />
                    {guide.rating.toFixed(1)} / 5
                  </p>
                </div>
              ) : null}
              {guide.pricePerDay ? (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Per Day</p>
                  <p className="font-medium text-lg">{guide.pricePerDay}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2 space-y-10">
            {gallery.length > 1 && (
              <div className="relative overflow-hidden rounded-sm aspect-[16/9] bg-lux-primary/5">
                <img
                  src={gallery[galleryIndex]}
                  alt={guide.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((prev) => (prev + 1) % gallery.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {(guide.bio || guide.shortBio) && (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-4">About {guide.name}</h2>
                <p className="text-muted-foreground leading-relaxed font-light whitespace-pre-line">
                  {guide.bio || guide.shortBio}
                </p>
              </div>
            )}

            {guide.specialties && guide.specialties.length > 0 && (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {guide.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs uppercase tracking-widest border border-border px-3 py-1.5 text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {guide.languages && guide.languages.length > 0 && (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-4 flex items-center gap-2">
                  <Languages className="w-6 h-6 text-lux-accent" /> Languages
                </h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {guide.languages.map((lang) => (
                    <li
                      key={lang}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-lux-accent shrink-0" />
                      {lang}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guide.certifications && guide.certifications.length > 0 && (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-lux-accent" /> Certifications
                </h2>
                <ul className="space-y-2">
                  {guide.certifications.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-lux-accent shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-border p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-headings text-xl">Guide Profile</h3>

              {!guide.available && (
                <p className="text-sm text-rose-600 font-medium border border-rose-200 bg-rose-50 px-3 py-2">
                  Currently unavailable for new bookings
                </p>
              )}

              <dl className="space-y-4 text-sm">
                {guide.experience ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-lux-accent" /> Experience
                    </dt>
                    <dd className="font-medium text-right">{guide.experience}</dd>
                  </div>
                ) : null}
                {guide.totalTrips ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground">Trips Completed</dt>
                    <dd className="font-medium text-right">{guide.totalTrips}+</dd>
                  </div>
                ) : null}
                {guide.baseCity ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground">Base City</dt>
                    <dd className="font-medium text-right">{guide.baseCity}</dd>
                  </div>
                ) : null}
                {guide.phoneNumber ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-lux-accent" /> Phone
                    </dt>
                    <dd className="font-medium text-right">{guide.phoneNumber}</dd>
                  </div>
                ) : null}
                {guide.email ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-lux-accent" /> Email
                    </dt>
                    <dd className="font-medium text-right break-all">{guide.email}</dd>
                  </div>
                ) : null}
              </dl>

              {guide.pricePerDay ? (
                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Daily Rate
                  </p>
                  <p className="font-headings text-2xl text-lux-primary">{guide.pricePerDay}</p>
                </div>
              ) : null}

              <a
                href={whatsAppUrl(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-lux-primary text-white px-6 py-3 rounded-sm text-xs uppercase tracking-[0.22em] font-bold hover:bg-lux-accent transition-colors"
              >
                Hire on WhatsApp
              </a>
              <Link
                to={`/request-quote?service=Tour+Guide&guide=${encodeURIComponent(guide.name)}`}
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
