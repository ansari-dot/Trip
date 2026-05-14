import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import logo from "../assets/logo_old.png";

export default function Footer() {
  return (
    <footer className="bg-lux-primary text-white pt-12 pb-[max(2.5rem,env(safe-area-inset-bottom))] px-4 sm:px-8 lg:px-12 border-t flex-shrink-0 sm:pt-20 sm:pb-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
        <div>
          <Link to="/" className="inline-block mb-4 sm:mb-6">
            <img src={logo} alt="North Paradise" className="h-16 sm:h-24 w-auto object-contain object-left" />
          </Link>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Explore the world with our tailored travel packages. Discover hidden gems, embrace new cultures, and make unforgettable memories.
          </p>
          <div className="flex gap-4">
            <a href="https://web.facebook.com/NPTATs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-lux-accent cursor-pointer transition-colors">
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a href="https://www.instagram.com/northparadisetreksandtours/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-lux-accent cursor-pointer transition-colors">
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-lux-accent cursor-pointer transition-colors">
              <Twitter className="w-5 h-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-lux-accent cursor-pointer transition-colors">
              <svg
                className="w-5 h-5 text-white fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.14-1.32-.09 1.29-.09 2.58-.09 3.87 0 2.52-1.1 5.02-3.08 6.58-2.54 2.14-6.42 2.21-9.05.15-2.52-1.93-3.46-5.41-2.16-8.3 1.01-2.4 3.75-4.04 6.35-3.69v4.11c-1.04-.15-2.14.07-2.91.82-.9.84-1.04 2.28-.4 3.37.52.92 1.66 1.41 2.68 1.12.82-.2 1.48-.87 1.72-1.68.08-1.57.03-3.13.04-4.7 0-3.61.01-7.22.01-10.83z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li><Link to="/about" className="hover:text-lux-accent transition-colors">About Us</Link></li>
            <li><Link to="/blogs" className="hover:text-lux-accent transition-colors">Blogs</Link></li>
            <li><Link to="/destinations" className="hover:text-lux-accent transition-colors">Destinations</Link></li>
            <li><Link to="/tour-packages" className="hover:text-lux-accent transition-colors">Tour Packages</Link></li>
            <li><Link to="/contact" className="hover:text-lux-accent transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li><Link to="/faq" className="hover:text-lux-accent transition-colors">FAQ</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-lux-accent transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-lux-accent transition-colors">Privacy Policy</Link></li>
            <li><Link to="/help-center" className="hover:text-lux-accent transition-colors">Help Center</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Contact Info</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li className="flex items-start gap-4">
              <MapPin className="w-4 h-4 text-lux-accent mt-0.5" />
              <span>Head Office, Yadgar Chowk, Skardu, Pakistan</span>
            </li>
            <li className="flex items-center gap-4">
              <Phone className="w-4 h-4 text-lux-accent" />
              <span>+92 345 678 9012</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail className="w-4 h-4 text-lux-accent" />
              <span>northparadisetreksandtours@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
