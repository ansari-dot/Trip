import { Mail, Phone, MapPin, Clock, Send, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
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
      <header className="w-full z-10 flex flex-col sm:flex-row justify-between items-center px-6 sm:px-12 py-3 bg-lux-primary text-white gap-4">
        <div className="flex items-center">
          <Link to="/">
            <img src={logo} alt="North Paradise" className="-my-4 h-24 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex gap-4 sm:gap-8 text-sm uppercase tracking-widest flex-wrap justify-center text-white">
          <Link to="/destinations" className="hover:text-lux-accent transition-colors">Destinations</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-lux-accent transition-colors uppercase tracking-widest text-sm focus:outline-none">
              Tour Packages <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-lux-primary/95 backdrop-blur-sm border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col shadow-xl z-50 text-white text-left">
              <Link to="/tour-packages?type=Adventure" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Adventure Tours</Link>
              <Link to="/tour-packages?type=Cultural" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Cultural Tours</Link>
              <Link to="/tour-packages?type=Honeymoon" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Honeymoon Packages</Link>
              <Link to="/tour-packages?type=Family" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Family Tours</Link>
              <Link to="/tour-packages?type=Religious" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Religious Tours</Link>
              <Link to="/tour-packages" className="px-4 py-3 bg-lux-accent/20 hover:bg-lux-accent/30 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold text-center">View All Packages</Link>
            </div>
          </div>
          <Link to="/about" className="hover:text-lux-accent transition-colors">About</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-lux-accent transition-colors uppercase tracking-widest text-sm focus:outline-none">
              Services <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-lux-primary/95 backdrop-blur-sm border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col shadow-xl z-50 text-white text-left">
              <Link to="/services/air-ticketing" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Air Ticketing</Link>
              <Link to="/services/jeep-safari" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Jeep Safari</Link>
              <Link to="/services/accommodation" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Accommodation</Link>
              <Link to="/services/tour-guide" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs border-b border-white/5">Tour Guide</Link>
              <Link to="/services/car-rent" className="px-4 py-3 hover:bg-white/10 transition-colors uppercase tracking-widest text-xs">Jeep/Car Rent</Link>
            </div>
          </div>
          <Link to="/contact" className="text-lux-accent transition-colors">Contact</Link>
        </nav>
        <Link to="/request-quote" className="bg-lux-accent text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
          Customize Trip
        </Link>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-lux-primary text-white overflow-hidden text-center px-6">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-lux-accent rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-lux-accent rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Mail className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <div className="text-lux-accent text-xs uppercase tracking-[0.2em] font-bold mb-4">Contact Us</div>
          <h1 className="font-headings text-4xl sm:text-5xl lg:text-6xl mb-6">
            Let's Start Your <span className="text-lux-accent italic font-light">Journey</span>
          </h1>
          <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto font-light">
            Have questions about our tours or need a custom itinerary? Our team of travel experts is here to help you plan the perfect escape.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-24 px-6 relative -mt-12 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Phone, title: "Phone", info: "+92 345 1234567", sub: "Mon-Sat, 9am-6pm", color: "bg-blue-50" },
              { icon: Mail, title: "Email", info: "info@northparadise.com", sub: "24/7 Online Support", color: "bg-purple-50" },
              { icon: MapPin, title: "Location", info: "Gilgit City, Pakistan", sub: "Karakoram Highway", color: "bg-orange-50" },
              { icon: Clock, title: "Working Hours", info: "09:00 AM - 06:00 PM", sub: "Except Sundays", color: "bg-green-50" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 border border-border shadow-sm hover:shadow-md transition-shadow group">
                <div className={`w-12 h-12 ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-lux-primary" />
                </div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-lux-primary/50 mb-2">{item.title}</h3>
                <p className="text-lg font-bold mb-1">{item.info}</p>
                <p className="text-sm text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form and Map */}
      <section className="py-12 pb-24 px-6">
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
                  Located in the heart of Gilgit, our main office is where the magic happens. We're always open for a cup of tea and a chat about your next adventure.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-sm shrink-0">
                      <MapPin className="w-5 h-5 text-lux-accent" />
                    </div>
                    <span className="text-sm">Main KKH Road, Near City Park, Gilgit, Pakistan</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-sm shrink-0">
                      <Mail className="w-5 h-5 text-lux-accent" />
                    </div>
                    <span className="text-sm">support@northparadise.com</span>
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
