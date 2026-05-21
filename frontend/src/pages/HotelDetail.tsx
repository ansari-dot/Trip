import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  BedDouble,
  Users,
  Maximize2,
  Phone,
  Mail,
  Globe,
  LoaderCircle,
  Clock,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { getApiUrl, parseJsonSafely } from "../lib/api";
import { whatsAppUrl } from "../lib/site";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

type HotelRoom = {
  name: string;
  description?: string;
  price?: string;
  image?: string;
  capacity?: string;
  beds?: string;
  size?: string;
  amenities?: string[];
};

type Hotel = {
  _id?: string;
  id: string;
  name: string;
  location: string;
  address?: string;
  category?: string;
  rating?: number;
  description?: string;
  image?: string;
  gallery?: string[];
  priceFrom?: string;
  amenities?: string[];
  rooms?: HotelRoom[];
  policies?: string;
  checkIn?: string;
  checkOut?: string;
  nearbyAttractions?: string[];
  phoneNumber?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
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
    address: hotel.address || "",
    category: hotel.category || "",
    rating: Number.isFinite(Number(hotel.rating)) ? Number(hotel.rating) : 0,
    description: hotel.description || "",
    image: hotel.image || "",
    gallery: Array.isArray(hotel.gallery) ? hotel.gallery : [],
    priceFrom: hotel.priceFrom || "",
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
    rooms: Array.isArray(hotel.rooms) ? hotel.rooms : [],
    policies: hotel.policies || "",
    checkIn: hotel.checkIn || "",
    checkOut: hotel.checkOut || "",
    nearbyAttractions: Array.isArray(hotel.nearbyAttractions)
      ? hotel.nearbyAttractions
      : [],
    phoneNumber: hotel.phoneNumber || "",
    email: hotel.email || "",
    website: hotel.website || "",
    latitude: hotel.latitude,
    longitude: hotel.longitude,
  };
}

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHotel = async () => {
      if (!id) {
        setError("Hotel not found.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(getApiUrl(`/api/hotels/${id}`));
        const data = await parseJsonSafely(response);
        if (!response.ok) {
          setError(data?.message || "Failed to load hotel.");
          setHotel(null);
          return;
        }
        const normalized = normalizeHotel(data?.data);
        if (!normalized) {
          setError("Hotel not found.");
          setHotel(null);
          return;
        }
        setHotel(normalized);
      } catch {
        setError("Unable to load hotel details.");
        setHotel(null);
      } finally {
        setIsLoading(false);
      }
    };
    void loadHotel();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
          <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
          <span className="text-sm">Loading hotel...</span>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-headings text-4xl mb-4">Hotel Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "This hotel could not be found."}
        </p>
        <Link
          to="/services/accommodation"
          className="text-lux-accent hover:underline"
        >
          Return to Accommodations
        </Link>
      </div>
    );
  }

  const gallery =
    hotel.gallery && hotel.gallery.length > 0
      ? hotel.gallery
      : hotel.image
      ? [hotel.image]
      : [];

  const nextImage = () => {
    if (gallery.length === 0) return;
    setGalleryIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    if (gallery.length === 0) return;
    setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const buildRoomEnquiryMessage = (room?: HotelRoom) => {
    const lines: string[] = [];
    lines.push("Assalamu Alaikum! I'm interested in booking a stay at:");
    lines.push("");
    lines.push(`🏨 *Hotel:* ${hotel.name}`);
    lines.push(`📍 *Location:* ${hotel.location}`);
    if (hotel.category) lines.push(`✨ *Category:* ${hotel.category}`);
    if (hotel.rating && hotel.rating > 0) lines.push(`⭐ *Rating:* ${hotel.rating.toFixed(1)} / 5`);
    if (hotel.address) lines.push(`🗺️ *Address:* ${hotel.address}`);

    if (room) {
      lines.push("");
      lines.push("*Room Details:*");
      lines.push(`🛏️ *Room Type:* ${room.name}`);
      if (room.price) lines.push(`💰 *Price:* ${room.price} / night`);
      if (room.capacity) lines.push(`👥 *Capacity:* ${room.capacity}`);
      if (room.beds) lines.push(`🛌 *Beds:* ${room.beds}`);
      if (room.size) lines.push(`📐 *Size:* ${room.size}`);
      if (room.amenities && room.amenities.length > 0) {
        lines.push(`🎯 *Room Amenities:* ${room.amenities.slice(0, 5).join(", ")}`);
      }
    } else if (hotel.priceFrom) {
      lines.push("");
      lines.push(`💰 *Starting From:* ${hotel.priceFrom}`);
    }

    lines.push("");
    lines.push("*Could you please help me with the following:*");
    lines.push("1️⃣ Is this room available on my preferred dates?");
    lines.push("2️⃣ What is the total cost for my stay (including taxes)?");
    lines.push("3️⃣ Is breakfast / meals included in the price?");
    lines.push("4️⃣ Do you offer airport / city pickup and transfers?");
    lines.push("5️⃣ What is the cancellation and refund policy?");
    lines.push("6️⃣ Are there any seasonal discounts or package deals available?");

    lines.push("");
    lines.push("*My preferred dates:* _(please share)_");
    lines.push("*Number of guests:* _(please share)_");

    return lines.join("\n");
  };

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO
        title={`${hotel.name} | ${hotel.location} | Hotels in Northern Pakistan`}
        description={`Book ${hotel.name} in ${hotel.location}. ${(
          hotel.description || "Premium accommodation with curated rooms, amenities and stunning views."
        ).slice(0, 150)}`}
        keywords={`${hotel.name}, hotels in ${hotel.location}, ${hotel.location} accommodation, Northern Pakistan hotels`}
        image={hotel.image}
      />
      <Navbar />

      {/* Hero */}
      <section
        className="relative h-[min(48vh,22rem)] sm:h-[60vh] min-h-[320px] sm:min-h-[500px] flex items-end pb-8 sm:pb-16 bg-cover bg-center pt-20 sm:pt-0"
        style={{
          backgroundImage: `url('${
            hotel.image ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000"
          }')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="relative z-10 text-white px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
          <Link
            to="/services/accommodation"
            className="inline-flex items-center text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-6 hover:text-lux-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Hotels
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="min-w-0">
              {hotel.category ? (
                <p className="text-lux-accent text-xs sm:text-sm uppercase tracking-widest mb-2 font-bold">
                  {hotel.category}
                </p>
              ) : null}
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-2 leading-[1.08]">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 text-sm sm:text-base text-white/90">
                <MapPin className="w-4 h-4 text-lux-accent" />
                {hotel.location}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-l-0 sm:border-l border-white/20 pl-0 sm:pl-6 w-full sm:w-auto">
              {hotel.rating && hotel.rating > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">
                    Rating
                  </p>
                  <p className="font-medium text-lg flex items-center gap-2">
                    <Star className="w-4 h-4 text-lux-accent fill-lux-accent" />{" "}
                    {hotel.rating.toFixed(1)} / 5
                  </p>
                </div>
              ) : null}
              {hotel.priceFrom ? (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">
                    Starting From
                  </p>
                  <p className="font-medium text-lg">{hotel.priceFrom}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-16">
          <div className="lg:col-span-2">
            {/* About */}
            <h2 className="font-headings text-3xl mb-6">About {hotel.name}</h2>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-light mb-10">
              {hotel.description ||
                "More details about this property will be available soon."}
            </p>
            {hotel.address ? (
              <div className="mb-10 flex items-start gap-3 bg-white p-4 border border-border rounded-sm">
                <MapPin className="w-5 h-5 text-lux-accent mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-lux-primary mb-1">
                    Address
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {hotel.address}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 ? (
              <div className="mb-12">
                <h3 className="font-headings text-2xl mb-6">Hotel Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hotel.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-white p-4 border border-border rounded-sm"
                    >
                      <div className="mt-0.5 bg-lux-bg p-1 rounded-full text-lux-accent">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="font-medium text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Rooms */}
            {hotel.rooms && hotel.rooms.length > 0 ? (
              <div className="mb-12">
                <h3 className="font-headings text-2xl mb-6">
                  Rooms &amp; Pricing
                </h3>
                <div className="space-y-5">
                  {hotel.rooms.map((room, idx) => (
                    <article
                      key={`${room.name}-${idx}`}
                      className="bg-white border border-border rounded-sm overflow-hidden flex flex-col md:flex-row"
                    >
                      <div
                        className="md:w-2/5 h-52 md:h-auto bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${
                            room.image ||
                            hotel.image ||
                            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1000"
                          }')`,
                        }}
                      />
                      <div className="p-5 sm:p-6 md:w-3/5 flex flex-col">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h4 className="font-headings text-xl text-lux-primary">
                            {room.name}
                          </h4>
                          {room.price ? (
                            <div className="text-right shrink-0">
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                Per Night
                              </div>
                              <div className="text-lg font-bold text-lux-primary">
                                {room.price}
                              </div>
                            </div>
                          ) : null}
                        </div>
                        {room.description ? (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {room.description}
                          </p>
                        ) : null}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-lux-primary/75 mb-4">
                          {room.capacity ? (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-lux-accent" />
                              {room.capacity}
                            </div>
                          ) : null}
                          {room.beds ? (
                            <div className="flex items-center gap-2">
                              <BedDouble className="w-4 h-4 text-lux-accent" />
                              {room.beds}
                            </div>
                          ) : null}
                          {room.size ? (
                            <div className="flex items-center gap-2">
                              <Maximize2 className="w-4 h-4 text-lux-accent" />
                              {room.size}
                            </div>
                          ) : null}
                        </div>

                        {room.amenities && room.amenities.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mb-5">
                            {room.amenities.slice(0, 6).map((a, ai) => (
                              <span
                                key={ai}
                                className="text-[11px] px-2.5 py-1 bg-lux-bg border border-border rounded-full text-lux-primary/75"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <a
                          href={whatsAppUrl(buildRoomEnquiryMessage(room))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto self-start inline-flex items-center gap-2 bg-lux-primary text-white px-5 py-2.5 rounded-sm text-[11px] uppercase tracking-[0.22em] font-bold hover:bg-lux-accent transition-colors"
                        >
                          Book This Room on WhatsApp
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Gallery */}
            {gallery.length > 0 ? (
              <div className="mb-12">
                <h3 className="font-headings text-2xl mb-6">Gallery</h3>
                <div className="relative group rounded-sm overflow-hidden bg-gray-100 aspect-video">
                  <img
                    src={gallery[galleryIndex]}
                    alt={`${hotel.name} - image ${galleryIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                  {gallery.length > 1 ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-between p-3 sm:p-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={prevImage}
                          className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
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
                            type="button"
                            onClick={() => setGalleryIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === galleryIndex
                                ? "bg-white w-4"
                                : "bg-white/50"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Policies */}
            {hotel.policies ? (
              <div className="mb-12">
                <h3 className="font-headings text-2xl mb-6">Hotel Policies</h3>
                <div className="bg-white border border-border p-6 rounded-sm">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hotel.policies}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Nearby Attractions */}
            {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 ? (
              <div className="mb-12">
                <h3 className="font-headings text-2xl mb-6">
                  Nearby Attractions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hotel.nearbyAttractions.map((attr, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-white p-4 border border-border rounded-sm"
                    >
                      <Sparkles className="w-4 h-4 text-lux-accent mt-0.5 shrink-0" />
                      <span className="text-sm">{attr}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white border border-border p-6 sm:p-8 rounded-2xl sm:rounded-sm static lg:sticky lg:top-28 shadow-sm">
              <h3 className="font-headings text-2xl mb-2">Book your stay</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Reach out for room availability, pricing details, and to lock
                in your preferred dates at {hotel.name}.
              </p>

              {(hotel.checkIn || hotel.checkOut) && (
                <div className="bg-lux-bg rounded-sm p-4 mb-6 space-y-3">
                  {hotel.checkIn ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-lux-primary/70">
                        <CalendarCheck className="w-4 h-4 text-lux-accent" />
                        Check-in
                      </span>
                      <span className="font-bold text-lux-primary">
                        {hotel.checkIn}
                      </span>
                    </div>
                  ) : null}
                  {hotel.checkOut ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-lux-primary/70">
                        <Clock className="w-4 h-4 text-lux-accent" />
                        Check-out
                      </span>
                      <span className="font-bold text-lux-primary">
                        {hotel.checkOut}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}

              {(hotel.phoneNumber || hotel.email || hotel.website) && (
                <div className="space-y-3 mb-6 text-sm">
                  {hotel.phoneNumber ? (
                    <a
                      href={`tel:${hotel.phoneNumber}`}
                      className="flex items-center gap-3 text-lux-primary hover:text-lux-accent transition-colors"
                    >
                      <Phone className="w-4 h-4 text-lux-accent" />
                      {hotel.phoneNumber}
                    </a>
                  ) : null}
                  {hotel.email ? (
                    <a
                      href={`mailto:${hotel.email}`}
                      className="flex items-center gap-3 text-lux-primary hover:text-lux-accent transition-colors break-all"
                    >
                      <Mail className="w-4 h-4 text-lux-accent" />
                      {hotel.email}
                    </a>
                  ) : null}
                  {hotel.website ? (
                    <a
                      href={hotel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-lux-primary hover:text-lux-accent transition-colors break-all"
                    >
                      <Globe className="w-4 h-4 text-lux-accent" />
                      Visit website
                    </a>
                  ) : null}
                </div>
              )}

              <a
                href={whatsAppUrl(buildRoomEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-lux-primary text-white px-6 py-3 rounded-sm text-xs uppercase tracking-[0.22em] font-bold hover:bg-lux-accent transition-colors"
              >
                Enquire on WhatsApp
              </a>
              <Link
                to={`/request-quote?service=Accommodation&hotel=${encodeURIComponent(
                  hotel.name
                )}`}
                className="mt-3 block text-center border border-lux-primary/20 text-lux-primary px-6 py-3 rounded-sm text-xs uppercase tracking-[0.22em] font-bold hover:border-lux-accent hover:text-lux-accent transition-colors"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
