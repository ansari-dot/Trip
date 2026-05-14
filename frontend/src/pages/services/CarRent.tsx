import { Link } from "react-router-dom";
import { Compass, CheckCircle, ShieldCheck, Map, Clock, LoaderCircle, CarFront, Fuel, Users, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import SEO from "../../components/SEO";
import Navbar from "../../components/Navbar";

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

function normalizeRentalVehicle(input: unknown): RentalVehicle | null {
  if (!input || typeof input !== "object") return null;
  const vehicle = input as RentalVehicle;
  if (!vehicle.id || !vehicle.name) return null;
  return {
    _id: vehicle._id,
    id: vehicle.id,
    name: vehicle.name,
    type: vehicle.type || "",
    price: vehicle.price || "",
    image: vehicle.image || "",
    description: vehicle.description || "",
    seats: vehicle.seats || "",
    transmission: vehicle.transmission || "",
    fuelType: vehicle.fuelType || "",
    withDriver: Boolean(vehicle.withDriver),
    features: Array.isArray(vehicle.features) ? vehicle.features : [],
    displayOrder: Number.isFinite(Number(vehicle.displayOrder)) ? Number(vehicle.displayOrder) : 0,
  };
}

export default function CarRent() {
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(getApiUrl("/api/rental-vehicles"));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setVehicles(data.data.map(normalizeRentalVehicle).filter(Boolean) as RentalVehicle[]);
        } else {
          setVehicles([]);
        }
      } catch {
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadVehicles();
  }, []);

  return (
    <div className="bg-lux-bg font-body text-lux-primary min-h-screen flex flex-col">
      <SEO
        title="Car & Jeep Rental Services | Gilgit, Skardu, Hunza"
        description="Rent luxury SUVs, 4x4 Jeeps, and comfortable cars for your journey in Northern Pakistan. Professional drivers and well-maintained vehicles."
        keywords="car rental Gilgit, rent a jeep Hunza, 4x4 rental Skardu, transport services Northern Pakistan, luxury car rental Pakistan"
      />
      <Navbar />

      <section
        className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2000')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
          <Map className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-4">Travel in Style</div>
          <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Premium <span className="text-lux-accent italic font-light">Vehicle Rentals</span>
          </h1>
          <p className="text-lg opacity-90 leading-relaxed max-w-2xl mx-auto mb-10">
            Navigate the stunning landscapes of Northern Pakistan at your own pace. Choose from our fleet of luxury SUVs, rugged 4x4s, and comfortable cars managed directly from our admin inventory.
          </p>
          <Link to="/request-quote?service=Car Rental" className="inline-block bg-lux-primary text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-lux-accent transition-colors">
            Inquire Now
          </Link>
        </div>
      </section>

      <section className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-headings text-4xl sm:text-5xl text-lux-primary">Drive with Confidence</h2>
            <div className="w-24 h-1 bg-lux-accent mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <ShieldCheck className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Immaculate Fleet</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Our vehicles undergo rigorous safety inspections, maintenance checks, and daily detailing to ensure a flawless driving experience.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Compass className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Chauffeur Services</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Prefer not to drive? Hire one of our discrete, professional chauffeurs who are intimately familiar with local mountain routes and terrain.</p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-lux-bg flex items-center justify-center rounded-full mx-auto mb-6 group-hover:bg-lux-accent transition-colors duration-300">
                <Clock className="w-10 h-10 text-lux-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-headings text-2xl mb-4 text-lux-primary">Flexible Terms</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">From simple daily rentals to month-long leases, we offer highly flexible terms that perfectly suit your specific itinerary and requirements.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-24 bg-lux-bg border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-3">Available Fleet</div>
            <h2 className="font-headings text-3xl sm:text-5xl text-lux-primary">Choose your car or jeep</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
                <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
                <span className="text-sm">Loading rental vehicles...</span>
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-sm border border-border bg-white px-6 py-16 text-center text-sm text-lux-primary/65">
              No rental vehicles have been added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {vehicles.map((vehicle) => (
                <article key={vehicle.id} className="overflow-hidden rounded-2xl sm:rounded-sm bg-white border border-border shadow-sm">
                  <div
                    className="h-64 bg-cover bg-center"
                    style={{ backgroundImage: `url('${vehicle.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"}')` }}
                  />
                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.24em] font-bold text-lux-accent mb-2">{vehicle.type || "Vehicle"}</div>
                        <h3 className="font-headings text-2xl text-lux-primary">{vehicle.name}</h3>
                      </div>
                      {vehicle.price ? (
                        <div className="px-3 py-2 bg-lux-bg text-lux-primary text-xs font-bold uppercase tracking-[0.14em] shrink-0">
                          {vehicle.price}
                        </div>
                      ) : null}
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                      {vehicle.description || "Comfortable and well-maintained rental vehicle for your Northern Pakistan journey."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm text-lux-primary/75">
                      <div className="flex items-center gap-2"><Users className="w-4 h-4 text-lux-accent" /> {vehicle.seats || "Flexible seating"}</div>
                      <div className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-lux-accent" /> {vehicle.transmission || "Manual / Auto"}</div>
                      <div className="flex items-center gap-2"><Fuel className="w-4 h-4 text-lux-accent" /> {vehicle.fuelType || "Fuel efficient"}</div>
                      <div className="flex items-center gap-2"><CarFront className="w-4 h-4 text-lux-accent" /> {vehicle.withDriver ? "With driver" : "Self drive"}</div>
                    </div>

                    {(vehicle.features || []).length > 0 ? (
                      <div className="space-y-2 mb-6">
                        {vehicle.features!.slice(0, 4).map((feature) => (
                          <div key={feature} className="flex items-start gap-3 text-sm text-lux-primary/75">
                            <CheckCircle className="w-4 h-4 text-lux-accent mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <Link to={`/request-quote?service=Car Rental&vehicle=${encodeURIComponent(vehicle.name)}`} className="block text-center bg-lux-primary text-white px-6 py-3 rounded-sm text-xs uppercase tracking-[0.22em] font-medium hover:bg-lux-accent transition-colors">
                      Rent This Vehicle
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-headings text-3xl sm:text-4xl text-lux-primary mb-12">Explore Other Services</h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/services/air-ticketing" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Air Ticketing</Link>
            <Link to="/services/jeep-safari" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Jeep Safari</Link>
            <Link to="/services/accommodation" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Accommodation</Link>
            <Link to="/services/tour-guide" className="px-8 py-4 border border-lux-primary text-lux-primary hover:bg-lux-primary hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">Tour Guide</Link>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-24 bg-lux-primary text-white text-center px-6 mt-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headings text-4xl sm:text-5xl mb-6">Start Your Engines</h2>
          <p className="text-lg opacity-90 font-light mb-10">
            Contact us today to secure the ideal vehicle for your Northern Pakistan expedition.
          </p>
          <Link to="/request-quote?service=Car Rental" className="inline-block bg-lux-accent text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-white hover:text-lux-primary transition-colors">
            Get Rental Quotes
          </Link>
        </div>
      </section>
    </div>
  );
}
