import { useState } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Phone, Mail } from "lucide-react";

const faqData = [
  {
    question: "What is the best time to visit Northern Pakistan?",
    answer: "The ideal time is between May and October. During these months, the weather is pleasant, and all mountain passes (like Khunjerab and Babusar) are open. Spring (April-May) is beautiful for blossoms, while Autumn (September-October) offers stunning foliage."
  },
  {
    question: "Is it safe to travel to Gilgit-Baltistan?",
    answer: "Yes, Gilgit-Baltistan is one of the safest regions in Pakistan for both domestic and international tourists. The local people are incredibly hospitable, and the crime rate is very low."
  },
  {
    question: "Do I need a special permit for trekking?",
    answer: "Some high-altitude treks or areas near international borders require specific NOCs (No Objection Certificates). North Paradise handles all the necessary permits and paperwork for our guests as part of our tour packages."
  },
  {
    question: "What kind of clothing should I pack?",
    answer: "Layering is key. Even in summer, nights in the mountains can be cold. Pack comfortable walking shoes, a waterproof jacket, sun protection, and some warm layers. If visiting religious sites, modest clothing is recommended."
  },
  {
    question: "Can I customize a tour package?",
    answer: "Absolutely! We specialize in custom itineraries. You can use our 'Request Quote' form or contact our advisors via WhatsApp to design a trip that fits your specific interests and budget."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO 
        title="FAQ & Help Center | North Paradise Treks and Tours"
        description="Find answers to frequently asked questions about traveling to Northern Pakistan, booking tours, and our services."
        keywords="travel FAQ Pakistan, help center, tour support, Gilgit travel guide"
      />
      <Navbar />

      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 bg-lux-primary text-white overflow-hidden text-center px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lux-accent rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <HelpCircle className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight px-1">
            Help <span className="text-lux-accent italic font-light">Center</span>
          </h1>
          <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto font-light">
            Everything you need to know about your upcoming adventure in the North.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-24 px-4 sm:px-6 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* FAQ Accordion */}
          <div className="lg:col-span-2">
            <h2 className="font-headings text-3xl mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm transition-all duration-300"
                >
                  <button 
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-start justify-between gap-4 p-4 sm:p-6 text-left hover:bg-lux-bg transition-colors focus:outline-none touch-manipulation"
                  >
                    <span className="font-bold text-base sm:text-lg leading-snug pr-2">{item.question}</span>
                    {openIndex === index ? <ChevronUp className="w-5 h-5 text-lux-accent" /> : <ChevronDown className="w-5 h-5 text-lux-accent" />}
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Support Sidebar */}
          <div className="space-y-8">
            <div className="bg-lux-primary text-white p-8 rounded-sm shadow-xl">
              <MessageCircle className="w-10 h-10 text-lux-accent mb-6" />
              <h3 className="font-headings text-2xl mb-4">Still Need Help?</h3>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">
                Our travel advisors are available 24/7 to assist you with any questions or special requirements.
              </p>
              <div className="space-y-4">
                <a href="https://wa.me/923456789012" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/10 rounded-sm hover:bg-white/20 transition-colors">
                  <Phone className="w-5 h-5 text-lux-accent" />
                  <span className="text-sm font-medium">+92 345 6789012</span>
                </a>
                <a href="mailto:northparadisetreksandtours@gmail.com" className="flex items-center gap-4 p-4 bg-white/10 rounded-sm hover:bg-white/20 transition-colors">
                  <Mail className="w-5 h-5 text-lux-accent" />
                  <span className="text-sm font-medium">northparadisetreksandtours@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="border border-gray-200 p-8 rounded-sm bg-white">
              <h4 className="font-bold mb-4">Office Hours</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex justify-between"><span>Mon - Fri:</span> <span>9 AM - 6 PM</span></li>
                <li className="flex justify-between"><span>Saturday:</span> <span>10 AM - 4 PM</span></li>
                <li className="flex justify-between"><span>Sunday:</span> <span>Closed</span></li>
              </ul>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
