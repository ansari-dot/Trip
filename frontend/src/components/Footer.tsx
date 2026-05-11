import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-lux-primary text-white pt-20 pb-10 px-6 sm:px-12 border-t flex-shrink-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div>
          <Link to="/" className="inline-block mb-6">
            <img src={logo} alt="North Paradise" className="h-24 w-auto object-contain" />
          </Link>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Explore the world with our tailored travel packages. Discover hidden gems, embrace new cultures, and make unforgettable memories.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-lux-accent cursor-pointer transition-colors">
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-lux-accent cursor-pointer transition-colors">
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-lux-accent cursor-pointer transition-colors">
              <Twitter className="w-5 h-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-lux-accent cursor-pointer transition-colors">
              <Youtube className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li><a href="#" className="hover:text-lux-accent transition-colors">About Us</a></li>
            <li><Link to="/destinations" className="hover:text-lux-accent transition-colors">Destinations</Link></li>
            <li><Link to="/tour-packages" className="hover:text-lux-accent transition-colors">Tour Packages</Link></li>
            <li><a href="#" className="hover:text-lux-accent transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li><a href="#" className="hover:text-lux-accent transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-lux-accent transition-colors">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-lux-accent transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-lux-accent transition-colors">Help Center</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Contact Info</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li className="flex items-start gap-4">
              <MapPin className="w-4 h-4 text-lux-accent mt-0.5" />
              <span>Head Office, Airport Road, Gilgit, Pakistan</span>
            </li>
            <li className="flex items-center gap-4">
              <Phone className="w-4 h-4 text-lux-accent" />
              <span>+92 345 678 9012</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail className="w-4 h-4 text-lux-accent" />
              <span>info@northparadise.com</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
