import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { Scale, CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO 
        title="Terms & Conditions | North Paradise Treks and Tours"
        description="Review the terms and conditions for booking tours and services with North Paradise Treks and Tours."
        keywords="terms and conditions, booking terms, travel agreement"
      />
      <Navbar />

      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 bg-lux-primary text-white overflow-hidden text-center px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-lux-accent rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Scale className="w-12 h-12 text-lux-accent mx-auto mb-6" />
          <h1 className="font-headings text-3xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight px-1">
            Terms & <span className="text-lux-accent italic font-light">Conditions</span>
          </h1>
          <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto font-light">
            Please read these terms carefully before booking your adventure with us.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-16 rounded-2xl sm:rounded-sm shadow-xl border border-gray-100">
          <div className="space-y-12 text-muted-foreground leading-relaxed">
            
            <section>
              <div className="flex items-center gap-3 mb-4 text-lux-primary">
                <CheckCircle className="w-6 h-6 text-lux-accent" />
                <h2 className="font-headings text-2xl font-bold">1. Booking & Payments</h2>
              </div>
              <p>
                A booking is confirmed only when a deposit of 30% of the total tour cost is received. The remaining balance must be paid at least 15 days before the departure date. For last-minute bookings (within 20 days of departure), full payment is required at the time of booking.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-lux-primary">
                <AlertCircle className="w-6 h-6 text-lux-accent" />
                <h2 className="font-headings text-2xl font-bold">2. Cancellation Policy</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cancellation 30+ days before departure: 100% refund of deposit (minus service fees).</li>
                <li>Cancellation 15-29 days before departure: 50% of the total tour cost will be charged.</li>
                <li>Cancellation less than 15 days before departure: No refund will be provided.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-lux-primary">
                <Calendar className="w-6 h-6 text-lux-accent" />
                <h2 className="font-headings text-2xl font-bold">3. Changes to Itinerary</h2>
              </div>
              <p>
                Due to the nature of travel in Northern Pakistan (weather, road conditions, etc.), North Paradise reserves the right to modify the itinerary for the safety and comfort of our guests. We will always strive to provide an equivalent or better experience.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-lux-primary">
                <ShieldCheck className="w-6 h-6 text-lux-accent" />
                <h2 className="font-headings text-2xl font-bold">4. Liability</h2>
              </div>
              <p>
                North Paradise Treks and Tours acts only as an agent for the various independent suppliers that provide transportation, sightseeing, activities, and hotel accommodations. We do not assume any liability for injury, damage, loss, or delay due to any cause beyond our control.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-sm italic">
                By booking a tour with us, you acknowledge that you have read and agreed to these Terms & Conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
