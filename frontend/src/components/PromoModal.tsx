import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [promoData, setPromoData] = useState<any>(null);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
        const res = await fetch(`${API_URL}/api/promo-modal`);
        const json = await res.json();
        if (json.success && json.data) {
          setPromoData(json.data);
          
          if (json.data.isActive) {
            const hasSeenPromo = sessionStorage.getItem('hasSeenPromo');
            if (!hasSeenPromo) {
              const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('hasSeenPromo', 'true');
              }, 1500);
              return () => clearTimeout(timer);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch promo modal data", err);
      }
    };
    
    fetchPromo();
  }, []);

  if (!isOpen || !promoData) return null;

  const waMessage = encodeURIComponent("Hi, I'm interested in the " + promoData.title + " offer. Can you provide more details?");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lux-primary/80 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-lux-bg w-full max-w-2xl rounded-sm shadow-2xl relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 border border-white/10">
        
        {/* Sleek Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-[60] p-2 flex items-center justify-center text-muted-foreground hover:text-lux-accent hover:rotate-90 transition-all duration-300 cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
        
        <div className="md:w-1/2 h-48 md:h-auto relative">
          <img 
            src={promoData.image} 
            alt={promoData.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col justify-center text-lux-primary bg-lux-bg relative z-10">
          <span className="text-lux-accent text-xs font-bold tracking-widest uppercase mb-2 block">{promoData.subtitle}</span>
          <h2 className="font-headings text-3xl mb-4">{promoData.title}</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            {promoData.description}
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              to="/tour-packages" 
              onClick={() => setIsOpen(false)}
              className="bg-lux-accent text-white px-6 py-3 text-sm font-medium uppercase tracking-wider text-center hover:bg-lux-primary transition-colors w-full rounded-sm shadow-sm"
            >
              Explore Offers
            </Link>
            <a 
              href={`https://wa.me/923488142776?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="border border-lux-primary text-lux-primary px-6 py-3 text-sm font-medium uppercase tracking-wider text-center hover:bg-lux-bg transition-colors w-full rounded-sm shadow-sm"
            >
              Talk to Advisor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
