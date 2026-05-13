import { Mail, Phone, MapPin, Clock, Send, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO
        title="Contact Us | Book Your Northern Pakistan Adventure"
        description="Get in touch with North Paradise Treks and Tours to plan your next trip to Northern Pakistan. We are here to help you with inquiries, bookings, and custom itineraries."
        keywords="contact North Paradise, Pakistan tour inquiry, book Pakistan trip, Gilgit Baltistan travel contact"
      />
      <Navbar />


      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 bg-lux-bg text-lux-primary text-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-lux-accent text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold mb-4 sm:mb-6">Contact Us</div>
          <h1 className="font-headings text-3xl sm:text-5xl lg:text-7xl mb-6 sm:mb-8 leading-tight">
            Let's Start Your <span className="text-lux-accent italic font-light font-body">Journey</span>
          </h1>
          <p className="text-base sm:text-lg opacity-60 leading-relaxed max-w-2xl mx-auto font-light mb-8 sm:mb-12 px-1">
            Have questions about our tours or need a custom itinerary? Our team of travel experts is here to help you plan the perfect escape.
          </p>

          <div className="flex justify-center gap-8 sm:gap-16 flex-wrap">
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full border border-lux-accent/20 flex items-center justify-center group-hover:bg-lux-accent group-hover:border-lux-accent transition-all duration-300">
                <Mail className="w-5 h-5 text-lux-accent group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Email</span>
            </div>
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full border border-lux-accent/20 flex items-center justify-center group-hover:bg-lux-accent group-hover:border-lux-accent transition-all duration-300">
                <Phone className="w-5 h-5 text-lux-accent group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Call</span>
            </div>
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full border border-lux-accent/20 flex items-center justify-center group-hover:bg-lux-accent group-hover:border-lux-accent transition-all duration-300">
                <MapPin className="w-5 h-5 text-lux-accent group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Visit</span>
            </div>
          </div>
        </div>
      </section>


      {/* Form and Map */}
      <section className="py-10 sm:py-12 pb-20 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div className="bg-white p-8 sm:p-12 border border-border">
              <h2 className="font-headings text-3xl mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-lux-bg border border-border px-4 py-3 outline-none focus:border-lux-accent transition-colors"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-lux-bg border border-border px-4 py-3 outline-none focus:border-lux-accent transition-colors"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Subject</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-lux-bg border border-border px-4 py-3 outline-none focus:border-lux-accent transition-colors"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full bg-lux-bg border border-border px-4 py-3 outline-none focus:border-lux-accent transition-colors resize-none"
                    placeholder="Tell us about your travel plans..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={status === "sending" || status === "success"}
                  className={`w-full py-4 uppercase tracking-[0.2em] text-xs font-bold transition-all flex items-center justify-center gap-3 ${status === "success"
                    ? "bg-green-600 text-white"
                    : "bg-lux-primary text-white hover:bg-lux-accent"
                    }`}
                >
                  {status === "sending" ? "Sending..." : status === "success" ? "Message Sent!" : (
                    <>
                      Send Message <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map Placeholder / Info */}
            <div className="space-y-8">
              <div className="bg-lux-primary text-white p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-lux-accent opacity-10 translate-x-1/2 -translate-y-1/2 rounded-full" />
                <h3 className="font-headings text-2xl mb-6">Our Head Office</h3>
                <p className="text-white/70 mb-8 leading-relaxed font-light">
                  Located at Yadgar Chowk, Skardu, our main office is where the magic happens. We're always open for a cup of tea and a chat about your next adventure.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-sm shrink-0">
                      <MapPin className="w-5 h-5 text-lux-accent" />
                    </div>
                    <span className="text-sm">Yadgar Chowk, Skardu, Pakistan</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-sm shrink-0">
                      <Mail className="w-5 h-5 text-lux-accent" />
                    </div>
                    <span className="text-sm">northparadisetreksandtours@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Fake Map Image */}
              <div className="relative aspect-video overflow-hidden border border-border group">
                <img
                  src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200"
                  alt="Map Location"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-lux-primary/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 bg-lux-accent rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                    <MapPin className="text-white w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
