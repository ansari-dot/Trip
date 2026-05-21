import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  LoaderCircle,
  CarFront,
  Users,
  Settings2,
  Fuel,
  Sparkles,
} from "lucide-react";
import { getApiUrl, parseJsonSafely } from "../lib/api";
import { whatsAppUrl } from "../lib/site";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

type RentalVehicle = {
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
};

function normalizeVehicle(input: unknown): RentalVehicle | null {
  if (!input || typeof input !== "object") return null;
  const v = input as RentalVehicle;
  if (!v.id || !v.name) return null;
  return {
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
  };
}

function buildVehicleEnquiryMessage(vehicle: RentalVehicle) {
  const lines: string[] = [];
  lines.push("Assalamu Alaikum! I'd like to rent this vehicle:");
  lines.push("");
  lines.push(`🚗 *Vehicle:* ${vehicle.name}`);
  if (vehicle.type) lines.push(`✨ *Type:* ${vehicle.type}`);
  if (vehicle.price) lines.push(`💰 *Rate:* ${vehicle.price}`);
  if (vehicle.seats) lines.push(`👥 *Seats:* ${vehicle.seats}`);
  if (vehicle.transmission) lines.push(`⚙️ *Transmission:* ${vehicle.transmission}`);
  if (vehicle.fuelType) lines.push(`⛽ *Fuel:* ${vehicle.fuelType}`);
  if (vehicle.withDriver) lines.push(`👨‍✈️ *With Driver:* Yes`);
  lines.push("");
  lines.push("*Could you please help me with:*");
  lines.push("1️⃣ Is this vehicle available on my preferred dates?");
  lines.push("2️⃣ What is the total rental cost for my trip?");
  lines.push("3️⃣ Is fuel included in the rental price?");
  lines.push("4️⃣ Can I get a driver, or is it self-drive only?");
  lines.push("5️⃣ What documents do I need to provide?");
  lines.push("6️⃣ What is the security deposit and cancellation policy?");
  lines.push("");
  lines.push("*My preferred dates:* _(please share)_");
  lines.push("*Pickup location:* _(please share)_");
  lines.push("*Trip route / destinations:* _(please share)_");
  return lines.join("\n");
}

export default function RentalVehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<RentalVehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Vehicle not found.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(getApiUrl(`/api/rental-vehicles/${id}`));
        const data = await parseJsonSafely(response);
        if (!response.ok) {
          setError(data?.message || "Failed to load vehicle.");
          setVehicle(null);
          return;
        }
        const normalized = normalizeVehicle(data?.data);
        if (!normalized) {
          setError("Vehicle not found.");
          setVehicle(null);
          return;
        }
        setVehicle(normalized);
      } catch {
        setError("Unable to load vehicle details.");
        setVehicle(null);
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
          <span className="text-sm">Loading vehicle...</span>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-headings text-4xl mb-4">Vehicle Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "This vehicle could not be found."}</p>
        <Link to="/services/car-rent" className="text-lux-accent hover:underline">
          Return to Car Rental
        </Link>
      </div>
    );
  }

  const waMessage = buildVehicleEnquiryMessage(vehicle);

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO
        title={`${vehicle.name} | Car Rental | Northern Pakistan`}
        description={(vehicle.description || "Vehicle rental in Northern Pakistan.").slice(0, 160)}
        keywords={`${vehicle.name}, car rental, ${vehicle.type}, Northern Pakistan`}
        image={vehicle.image}
      />
      <Navbar />

      <section
        className="relative h-[min(48vh,22rem)] sm:h-[60vh] min-h-[320px] sm:min-h-[500px] flex items-end pb-8 sm:pb-16 bg-cover bg-center pt-20 sm:pt-0"
        style={{
          backgroundImage: `url('${
            vehicle.image ||
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2000"
          }')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="relative z-10 text-white px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
          <Link
            to="/services/car-rent"
            className="inline-flex items-center text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-6 hover:text-lux-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Car Rental
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="min-w-0">
              {vehicle.type ? (
                <p className="text-lux-accent text-xs sm:text-sm uppercase tracking-widest mb-2 font-bold">
                  {vehicle.type}
                </p>
              ) : null}
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-2 leading-[1.08]">
                {vehicle.name}
              </h1>
              {vehicle.withDriver ? (
                <p className="text-sm text-white/80">Available with professional driver</p>
              ) : null}
            </div>
            {vehicle.price ? (
              <div className="border-l-0 sm:border-l border-white/20 pl-0 sm:pl-6">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Per Day</p>
                <p className="font-medium text-lg">{vehicle.price}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2 space-y-10">
            {vehicle.description ? (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-4">About This Vehicle</h2>
                <p className="text-muted-foreground leading-relaxed font-light whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            ) : null}

            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-lux-accent" /> Features
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {vehicle.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-lux-accent shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-border p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-headings text-xl">Vehicle Specs</h3>
              <dl className="space-y-4 text-sm">
                {vehicle.seats ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-lux-accent" /> Seats
                    </dt>
                    <dd className="font-medium text-right">{vehicle.seats}</dd>
                  </div>
                ) : null}
                {vehicle.transmission ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Settings2 className="w-3.5 h-3.5 text-lux-accent" /> Transmission
                    </dt>
                    <dd className="font-medium text-right">{vehicle.transmission}</dd>
                  </div>
                ) : null}
                {vehicle.fuelType ? (
                  <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-lux-accent" /> Fuel
                    </dt>
                    <dd className="font-medium text-right">{vehicle.fuelType}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground flex items-center gap-1">
                    <CarFront className="w-3.5 h-3.5 text-lux-accent" /> Driver
                  </dt>
                  <dd className="font-medium text-right">
                    {vehicle.withDriver ? "Included / Available" : "Self-drive"}
                  </dd>
                </div>
              </dl>

              {vehicle.price ? (
                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Daily Rate
                  </p>
                  <p className="font-headings text-2xl text-lux-primary">{vehicle.price}</p>
                </div>
              ) : null}

              <a
                href={whatsAppUrl(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-lux-primary text-white px-6 py-3 rounded-sm text-xs uppercase tracking-[0.22em] font-bold hover:bg-lux-accent transition-colors"
              >
                Rent on WhatsApp
              </a>
              <Link
                to={`/request-quote?service=Car+Rental&vehicle=${encodeURIComponent(vehicle.name)}`}
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
