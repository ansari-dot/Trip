import { useState, useEffect } from "react";
import { X, Send, LoaderCircle } from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/$/, "");

export default function QuoteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsappNumber: "",
    destination: "",
    travelDates: "",
    travelers: 2,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener("open-quote-modal", handleOpenModal);
    return () => window.removeEventListener("open-quote-modal", handleOpenModal);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/quotes`, {
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
          message: "",
        });
        setTimeout(() => setIsOpen(false), 3000); // Close after 3 seconds on success
      } else {
        setError(data.message || "Failed to submit request.");
      }
    } catch (err) {
      setError("An error occurred while submitting the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-lux-bg">
          <h2 className="font-headings text-2xl text-lux-primary">Request a Quote</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-lux-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {successMessage ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="font-headings text-2xl mb-2">Request Sent!</h3>
              <p className="text-muted-foreground">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-sm">{error}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-lux-primary">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-lux-accent"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-lux-primary">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-lux-accent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-lux-primary">WhatsApp Number *</label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  required
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-lux-accent"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-lux-primary">Destination of Interest</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-lux-accent"
                  placeholder="e.g. Bali, Paris..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-lux-primary">Travel Dates</label>
                  <input
                    type="text"
                    name="travelDates"
                    value={formData.travelDates}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-lux-accent"
                    placeholder="e.g. Oct 15 - Oct 25"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-lux-primary">Number of Travelers</label>
                  <input
                    type="number"
                    name="travelers"
                    min="1"
                    value={formData.travelers}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-lux-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-lux-primary">Any specific requirements?</label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-lux-accent resize-none"
                  placeholder="Tell us more about your dream trip..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-lux-accent text-white py-3 rounded-sm font-medium uppercase tracking-wider hover:bg-lux-accent/90 transition-colors flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <><LoaderCircle className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
