import { Link } from "react-router-dom";
import { getApiUrl, parseJsonSafely, API_BASE } from "../lib/api";
import { Compass, ShieldCheck, Headset, Star, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string[];
  displayOrder: number;
};

const TEAM_FALLBACKS: TeamMember[] = [
  {
    _id: "fallback-1",
    name: "Aqeel Ahmed",
    role: "Founder & Tour Director",
    bio: "Designs thoughtful journeys across Northern Pakistan with a strong focus on local insight, guest comfort, and smooth on-ground execution.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
    specialties: ["Custom itineraries", "Group leadership", "Local partnerships"],
    displayOrder: 0,
  },
  {
    _id: "fallback-2",
    name: "Sara Khan",
    role: "Guest Experience Lead",
    bio: "Coordinates every detail before and during each trip so travelers feel supported, informed, and genuinely cared for from start to finish.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
    specialties: ["Guest care", "Travel planning", "24/7 support"],
    displayOrder: 1,
  },
  {
    _id: "fallback-3",
    name: "Hamza Ali",
    role: "Adventure Operations Manager",
    bio: "Handles transport, timing, and field logistics for mountain routes, making complex itineraries feel effortless and reliable.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800",
    specialties: ["Route planning", "Safety checks", "Transport logistics"],
    displayOrder: 2,
  },
];

function normalizeTeamMember(input: unknown): TeamMember | null {
  if (!input || typeof input !== "object") return null;
  const member = input as TeamMember;
  if (!member._id || !member.name || !member.role) return null;
  return {
    _id: member._id,
    name: member.name,
    role: member.role,
    bio: member.bio || "",
    image: member.image || "",
    specialties: Array.isArray(member.specialties) ? member.specialties : [],
    displayOrder: Number.isFinite(Number(member.displayOrder)) ? Number(member.displayOrder) : 0,
  };
}

export default function About() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoadingTeam(true);
      try {
        const response = await fetch(getApiUrl("/api/team-members"));
        const data = await parseJsonSafely(response);
        if (response.ok && Array.isArray(data?.data)) {
          setTeamMembers(data.data.map(normalizeTeamMember).filter(Boolean) as TeamMember[]);
        } else {
          setTeamMembers([]);
        }
      } catch {
        setTeamMembers([]);
      } finally {
        setIsLoadingTeam(false);
      }
    };

    void loadTeamMembers();
  }, []);

  const displayedTeam = teamMembers.length > 0 ? teamMembers : TEAM_FALLBACKS;

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO
        title="About Us | North Paradise Treks and Tours"
        description="Learn more about North Paradise Treks and Tours, our story, and the team behind our travel experiences across Northern Pakistan."
        keywords="about North Paradise, Pakistan travel agency, northern Pakistan team, tour operator Pakistan"
      />
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,169,97,0.16),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.3),_transparent)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent sm:text-xs">Our Story</div>
          <h1 className="font-headings text-3xl leading-tight sm:text-5xl lg:text-7xl">
            Crafted by locals,
            <span className="mt-2 block italic font-light">designed for unforgettable journeys</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base font-light leading-relaxed text-lux-primary/70 sm:text-lg">
            North Paradise Treks and Tours creates meaningful travel across Northern Pakistan with warm hospitality, sharp logistics, and experiences that feel personal from the first call to the final goodbye.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 px-4 py-4 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24 lg:px-12">
        <div>
          <h2 className="font-headings text-3xl sm:text-4xl">Travel that feels personal</h2>
          <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
            We believe the best trips are not just scenic. They are well-guided, deeply local, and carefully paced around the people taking them.
          </p>
          <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
            From family vacations to adventure escapes, our team plans each route with attention to comfort, safety, and the small details that make a journey feel effortless.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:rounded-sm">
              <p className="font-headings text-4xl text-lux-primary">10+</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">Years Of Service</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:rounded-sm">
              <p className="font-headings text-4xl text-lux-primary">1000+</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">Happy Travelers</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl sm:rounded-sm">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1400"
              alt="Northern Pakistan mountains"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-4 max-w-xs rounded-2xl bg-lux-primary p-6 text-white shadow-xl sm:-left-8 sm:rounded-sm">
            <Star className="mb-4 h-8 w-8 text-lux-accent" />
            <p className="font-headings text-xl">Local knowledge, premium care, and beautifully planned routes.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mb-12 text-center sm:mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent sm:text-xs">Why Choose Us</div>
          <h2 className="mt-4 font-headings text-3xl sm:text-4xl">The North Paradise Promise</h2>
          <p className="mx-auto mt-4 max-w-2xl font-light leading-relaxed text-muted-foreground">
            Every itinerary is shaped around care, clarity, and a genuine love for the region we call home.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:rounded-sm">
            <Compass className="mb-6 h-10 w-10 text-lux-accent" />
            <h3 className="font-headings text-xl">Tailored Itineraries</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              We shape every trip around your pace, interests, and travel style instead of offering one-size-fits-all plans.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:rounded-sm">
            <ShieldCheck className="mb-6 h-10 w-10 text-lux-accent" />
            <h3 className="font-headings text-xl">Reliable Operations</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Our routes, transport, stays, and timing are planned carefully so your experience stays smooth and stress-free.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:rounded-sm">
            <Headset className="mb-6 h-10 w-10 text-lux-accent" />
            <h3 className="font-headings text-xl">Human Support</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              You are backed by a responsive team before departure, during travel, and whenever plans need a quick adjustment.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(201,169,97,0.12),_transparent_60%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-lux-primary/10 bg-lux-bg shadow-sm">
              <Headset className="h-7 w-7 text-lux-primary" />
            </div>
            <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent sm:text-xs">Meet The Team</div>
            <h2 className="mt-4 font-headings text-3xl sm:text-5xl">The people behind your trip</h2>
            <p className="mx-auto mt-4 max-w-2xl font-light leading-relaxed text-muted-foreground">
              This section is managed from the admin panel, while the layout follows the clean rounded style you shared.
            </p>
          </div>

          {isLoadingTeam ? (
            <div className="flex items-center justify-center rounded-2xl border border-border bg-lux-bg px-6 py-16 text-sm text-lux-primary/70 sm:rounded-sm">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" />
              Loading team members...
            </div>
          ) : (
            <div className="overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-stretch gap-6">
                {displayedTeam.map((member) => (
                  <article
                    key={member._id}
                    className="group relative flex min-h-[185px] w-[360px] shrink-0 overflow-hidden rounded-[2.5rem] border border-lux-primary/10 bg-[#f5f1ea] shadow-[0_18px_50px_rgba(28,28,28,0.07)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(28,28,28,0.12)] sm:w-[400px]"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent_45%)]" />
                    <div className="relative flex h-full w-full flex-col justify-center p-3 sm:p-3.5">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="shrink-0">
                          <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-white shadow-lg sm:h-20 sm:w-20">
                            <img
                              src={member.image || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=900"}
                              alt={member.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 h-px w-9 bg-lux-accent/70" />
                          <h3 className="font-headings text-[1.25rem] leading-tight text-lux-primary sm:text-[1.45rem]">
                            {member.name}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-lux-primary/55 sm:text-xs">
                            {member.role}
                          </p>
                        </div>
                      </div>

                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-lux-primary px-4 py-16 text-center text-white sm:px-8 sm:py-24 lg:px-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="font-headings text-3xl sm:text-5xl">Ready to plan something special?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/80">
            Speak with our team and let us shape a journey that fits your time, style, and dream destination.
          </p>
          <Link to="/request-quote" className="mt-10 inline-block rounded-full bg-lux-accent px-8 py-4 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-lux-primary sm:rounded-sm">
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
