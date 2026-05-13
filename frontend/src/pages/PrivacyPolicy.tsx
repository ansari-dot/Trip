import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO 
        title="Privacy Policy | North Paradise Treks and Tours"
        description="Read our privacy policy to understand how we collect, use, and protect your personal information at North Paradise Treks and Tours."
        keywords="privacy policy, data protection, North Paradise privacy"
      />
      <Navbar />

      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 bg-lux-primary text-white overflow-hidden text-center px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-lux-accent rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <ShieldCheck className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight px-1">
            Privacy <span className="text-lux-accent italic font-light">Policy</span>
          </h1>
          <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto font-light">
            Your privacy is of paramount importance to us. This policy outlines our commitment to protecting your personal data.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-16 rounded-2xl sm:rounded-sm shadow-xl border border-gray-100">
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-lux-accent" />
                <h2 className="font-headings text-2xl font-bold">Data Collection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We collect information that you provide directly to us when booking a tour, requesting a quote, or contacting our support team. This may include your name, email address, phone number, passport details, and travel preferences.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-lux-accent" />
                <h2 className="font-headings text-2xl font-bold">How We Use Your Information</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your information is used solely to provide and improve our travel services, process your bookings, communicate with you regarding your itinerary, and send you occasional updates about our latest tour packages (if opted-in).
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-lux-accent" />
                <h2 className="font-headings text-2xl font-bold">Information Security</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We implement a variety of security measures to maintain the safety of your personal information. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to trusted third parties (like hotels or airlines) who assist us in operating our services.
              </p>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-sm text-muted-foreground italic">
                Last Updated: May 11, 2026. For any questions regarding this policy, please contact us at northparadisetreksandtours@gmail.com.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
