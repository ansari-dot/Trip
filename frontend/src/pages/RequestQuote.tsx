import { Link, useSearchParams } from "react-router-dom";
import { getApiUrl, parseJsonSafely, API_BASE } from "../lib/api";
import { ChevronLeft, Send, LoaderCircle, MapPin, Calendar, Users, Phone, Mail, User, Compass, Clock } from "lucide-react";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";
import SEO from "../components/SEO";

export default function RequestQuote() {
  const [searchParams] = useSearchParams();
  const serviceFromUrl = searchParams.get("service");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsappNumber: "",
    destination: "",
    travelDates: "",
    travelers: 2,
    numberOfDays: "",
    message: "",
    serviceType: "",
    serviceDetails: {} as Record<string, string>,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (serviceFromUrl) {
      setFormData(prev => ({ ...prev, serviceType: serviceFromUrl }));
    }
  }, [serviceFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("detail_")) {
      const detailKey = name.replace("detail_", "");
      setFormData((prev) => ({
        ...prev,
        serviceDetails: { ...prev.serviceDetails, [detailKey]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(getApiUrl("/api/quotes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "Admin will contact you shortly.");
          setFormData({
            name: "",
            email: "",
            whatsappNumber: "",
            destination: "",
            travelDates: "",
            travelers: 2,
            numberOfDays: "",
            message: "",
            serviceType: "",
            serviceDetails: {},
          });
      } else {
        setError(data.message || "Failed to submit request.");
      }
    } catch (err) {
      setError("An error occurred while submitting the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-lux-bg font-body text-lux-primary">
      <SEO 
        title="Request a Quote | Customize Your Northern Pakistan Trip"
        description="Plan your custom itinerary with North Paradise Treks and Tours. Request a quote for your dream trip to Hunza, Skardu, Gilgit, and more."
        keywords="request quote Pakistan tour, custom trip Pakistan, book Hunza tour, Skardu travel inquiry"
      />
      {/* Left side - Image & Branding */}
      <div className="md:w-5/12 lg:w-1/2 relative min-h-[34vh] sm:min-h-[40vh] md:min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 text-white overflow-hidden rounded-b-[2rem] md:rounded-none">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?auto=format&fit=crop&q=80&w=2000')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
          
          <div className="relative z-10 max-w-xl mx-auto">
            <h1 className="font-headings text-2xl sm:text-4xl lg:text-6xl mb-4 sm:mb-6 leading-tight">
              {serviceFromUrl ? `Book Our ${serviceFromUrl}` : "Design Your"} <br />
              <span className="text-lux-accent italic font-light">{serviceFromUrl ? "Service" : "Dream Journey"}</span>
            </h1>
            
            <p className="text-sm sm:text-lg opacity-90 max-w-md font-light leading-relaxed mb-6 sm:mb-12">
              Every great adventure begins with a conversation. Share your travel aspirations with us, and our luxury concierges will curate an itinerary perfectly tailored to you.
            </p>
          </div>

          <div className="relative z-10 max-w-xl mx-auto w-full grid grid-cols-2 gap-8 border-t border-white/20 pt-8 mt-auto hidden md:grid">
          <div>
            <Compass className="w-6 h-6 text-lux-accent mb-3" />
            <h4 className="font-headings text-lg mb-1">Bespoke Design</h4>
            <p className="text-xs text-white/70">100% tailor-made itineraries.</p>
          </div>
          <div>
            <Users className="w-6 h-6 text-lux-accent mb-3" />
            <h4 className="font-headings text-lg mb-1">24/7 Support</h4>
            <p className="text-xs text-white/70">Dedicated concierge during travel.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="md:w-7/12 lg:w-1/2 flex items-center justify-center p-4 sm:p-12 lg:p-20 bg-white pb-[max(2rem,env(safe-area-inset-bottom))] md:pb-12">
        <div className="w-full max-w-xl">
          {successMessage ? (
            <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                <Send className="w-10 h-10 ml-2" />
              </div>
              <h2 className="font-headings text-4xl mb-4">Request Received</h2>
              <p className="text-muted-foreground text-lg mb-8">{successMessage}</p>
              <Link to="/" className="bg-lux-primary text-white px-8 py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-lux-accent transition-colors inline-block">
                Return Home
              </Link>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-10">
                <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-3">
                  {serviceFromUrl ? `${serviceFromUrl} Inquiry` : "Get a Quote"}
                </div>
                <h2 className="font-headings text-3xl sm:text-4xl text-lux-primary">
                  {serviceFromUrl ? "Service Request" : "Start Planning"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="text-red-600 text-sm p-4 bg-red-50 border border-red-100 rounded-sm">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    required
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                    placeholder="With country code (e.g. +1 234 567 8900)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Destination of Interest
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                    placeholder="e.g. Swiss Alps, Bali, Paris..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> Travel Dates
                    </label>
                    <input
                      type="text"
                      name="travelDates"
                      value={formData.travelDates}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      placeholder="e.g. Mid October"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Days
                    </label>
                    <input
                      type="number"
                      name="numberOfDays"
                      min="1"
                      value={formData.numberOfDays}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      placeholder="e.g. 7"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Travelers
                    </label>
                    <input
                      type="number"
                      name="travelers"
                      min="1"
                      value={formData.travelers}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Service-Specific Fields */}
                {serviceFromUrl === "Air Ticketing" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Departure City</label>
                      <input
                        type="text"
                        name="detail_departureCity"
                        value={formData.serviceDetails.departureCity || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                        placeholder="e.g. New York, London..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Preferred Class</label>
                      <select
                        name="detail_preferredClass"
                        value={formData.serviceDetails.preferredClass || "Economy"}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      >
                        <option value="Economy">Economy</option>
                        <option value="Premium Economy">Premium Economy</option>
                        <option value="Business">Business</option>
                        <option value="First Class">First Class</option>
                      </select>
                    </div>
                  </div>
                )}

                {serviceFromUrl === "Jeep Safari" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Pickup Location</label>
                      <input
                        type="text"
                        name="detail_pickupLocation"
                        value={formData.serviceDetails.pickupLocation || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                        placeholder="e.g. Gilgit Airport, Hotel..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Preferred Route</label>
                      <input
                        type="text"
                        name="detail_preferredRoute"
                        value={formData.serviceDetails.preferredRoute || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                        placeholder="e.g. Fairy Meadows, Deosai..."
                      />
                    </div>
                  </div>
                )}

                {serviceFromUrl === "Accommodation" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Room Type</label>
                      <select
                        name="detail_roomType"
                        value={formData.serviceDetails.roomType || "Standard Double"}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      >
                        <option value="Standard Double">Standard Double</option>
                        <option value="Deluxe Suite">Deluxe Suite</option>
                        <option value="Family Room">Family Room</option>
                        <option value="Executive Suite">Executive Suite</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Hotel Category</label>
                      <select
                        name="detail_hotelCategory"
                        value={formData.serviceDetails.hotelCategory || "4 Star"}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      >
                        <option value="Boutique">Boutique</option>
                        <option value="4 Star">4 Star</option>
                        <option value="5 Star">5 Star</option>
                        <option value="Luxury Resort">Luxury Resort</option>
                      </select>
                    </div>
                  </div>
                )}

                {serviceFromUrl === "Tour Guide" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Language Preference</label>
                      <input
                        type="text"
                        name="detail_language"
                        value={formData.serviceDetails.language || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                        placeholder="e.g. English, French, Chinese..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Guide Expertise</label>
                      <select
                        name="detail_expertise"
                        value={formData.serviceDetails.expertise || "Cultural"}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      >
                        <option value="Cultural">Cultural & History</option>
                        <option value="Adventure">Adventure & Trekking</option>
                        <option value="Photography">Photography</option>
                        <option value="Wildlife">Wildlife & Nature</option>
                      </select>
                    </div>
                  </div>
                )}

                {serviceFromUrl === "Car Rental" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Vehicle Type</label>
                      <select
                        name="detail_vehicleType"
                        value={formData.serviceDetails.vehicleType || "SUV (4x4)"}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      >
                        <option value="SUV (4x4)">SUV (4x4)</option>
                        <option value="Luxury Sedan">Luxury Sedan</option>
                        <option value="Mini Van">Mini Van</option>
                        <option value="Coaster">Coaster (Groups)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Rental Option</label>
                      <select
                        name="detail_rentalOption"
                        value={formData.serviceDetails.rentalOption || "With Professional Driver"}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm"
                      >
                        <option value="With Professional Driver">With Professional Driver</option>
                        <option value="Self Drive">Self Drive (Terms apply)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-lux-primary/70">Special Requests & Details</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-lux-bg border border-border rounded-sm focus:outline-none focus:border-lux-accent focus:bg-white transition-colors text-sm resize-none"
                    placeholder="Tell us about any specific requirements, celebrations, or preferences..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-lux-primary text-white py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-lux-accent transition-colors flex justify-center items-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><LoaderCircle className="w-5 h-5 animate-spin" /> Submitting...</>
                  ) : (
                    <>Submit Request <Send className="w-4 h-4" /></>
                  )}
                </button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Your information is kept strictly confidential.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
