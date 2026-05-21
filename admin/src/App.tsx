import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowUpRight,
  BedDouble,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Car,
  Compass,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  Snowflake,
  Star,
  Tags,
  Trash2,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import Quotes from './pages/Quotes';
import Enquiries from './pages/Enquiries';
import { API_BASE, getApiUrl } from './lib/api';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'heroes', label: 'Hero Slides', icon: ArrowUpRight },
  { id: 'destinations', label: 'Destinations', icon: MapPin },
  { id: 'blogs', label: 'Blogs', icon: BookOpen },
  { id: 'rental-vehicles', label: 'Rental Vehicles', icon: Car },
  { id: 'vehicle-categories', label: 'Vehicle Categories', icon: Tags },
  { id: 'jeep-safaris', label: 'Jeep Safaris', icon: Compass },
  { id: 'safari-categories', label: 'Safari Categories', icon: Tags },
  { id: 'tour-guides', label: 'Tour Guides', icon: UserRound },
  { id: 'guide-specialties', label: 'Guide Specialties', icon: Tags },
  { id: 'hotels', label: 'Hotels', icon: BedDouble },
  { id: 'hotel-categories', label: 'Hotel Categories', icon: Tags },
  { id: 'packages', label: 'Tour Packages', icon: Package },
  { id: 'tour-types', label: 'Tour Types', icon: Tags },
  { id: 'featured-tours', label: 'Featured Tours', icon: Star },
  { id: 'seasonal-tours', label: 'Seasonal Selection', icon: Snowflake },
  { id: 'testimonials', label: 'Testimonials', icon: Users },
  { id: 'team', label: 'Team Members', icon: Briefcase },
  { id: 'promo-modal', label: 'Promo Modal', icon: AlertCircle },
  { id: 'quotes', label: 'Quote Requests', icon: MessageSquare },
  { id: 'enquiries', label: 'AI Trip Planner', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
];

type AdminUser = {
  _id?: string;
  email: string;
  name?: string;
};

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

type SessionState = 'checking' | 'authenticated' | 'unauthenticated';

type TourPackage = {
  _id?: string;
  id: string;
  title: string;
  destinations?: string[];
  duration?: string;
  price?: string;
  image?: string;
  type?: string;
  description?: string;
  itinerary?: { day: string; title: string; description: string }[];
  tourPackages?: { tier: string; price: string; description: string }[];
  featured?: boolean;
  isSeasonal?: boolean;
  gallery?: string[];
};

type TourPackageFormState = {
  id: string;
  title: string;
  destinations: string;
  duration: string;
  price: string;
  image: string;
  type: string;
  description: string;
  itinerary: string;
  tourPackages: string;
  gallery: string;
};

const EMPTY_TOUR_FORM: TourPackageFormState = {
  id: '',
  title: '',
  destinations: '',
  duration: '',
  price: '',
  image: '',
  type: '',
  description: '',
  itinerary: '',
  tourPackages: '',
  gallery: '[]',
};

function normalizeTourPackage(input: unknown): TourPackage | null {
  if (!input || typeof input !== 'object') return null;
  const t = input as TourPackage;
  if (!t.id || !t.title) return null;
  return {
    _id: t._id,
    id: t.id,
    title: t.title,
    destinations: Array.isArray(t.destinations) ? t.destinations : [],
    duration: t.duration || '',
    price: t.price || '',
    image: t.image || '',
    type: t.type || '',
    description: t.description || '',
    itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
    tourPackages: Array.isArray(t.tourPackages) ? t.tourPackages : [],
    featured: Boolean(t.featured),
    isSeasonal: Boolean(t.isSeasonal),
    gallery: Array.isArray(t.gallery) ? t.gallery : [],
  };
}

function tourToFormState(t: TourPackage): TourPackageFormState {
  return {
    id: t.id,
    title: t.title,
    destinations: (t.destinations || []).join('\n'),
    duration: t.duration || '',
    price: t.price || '',
    image: t.image || '',
    type: t.type || '',
    description: t.description || '',
    itinerary: JSON.stringify(t.itinerary || [], null, 2),
    tourPackages: JSON.stringify(t.tourPackages || [], null, 2),
    gallery: JSON.stringify(t.gallery || [], null, 2),
  };
}

type Destination = {
  _id?: string;
  id: string;
  name: string;
  location: string;
  tours?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  highlights?: string[];
  price?: string;
  duration?: string;
  expertTip?: string;
  cuisine?: string;
  whenToGo?: string;
  latitude?: number;
  longitude?: number;
};

type DestinationFormState = {
  id: string;
  name: string;
  location: string;
  tours: string;
  description: string;
  image: string;
  highlights: string;
  price: string;
  duration: string;
  expertTip: string;
  cuisine: string;
  whenToGo: string;
  latitude: string;
  longitude: string;
};

const EMPTY_DESTINATION_FORM: DestinationFormState = {
  id: '',
  name: '',
  location: '',
  tours: '',
  description: '',
  image: '',
  highlights: '',
  price: '',
  duration: '',
  expertTip: '',
  cuisine: '',
  whenToGo: '',
  latitude: '',
  longitude: '',
};

async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getValidatedAdmin(data: unknown): AdminUser | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const admin = (data as { admin?: unknown }).admin;
  if (!admin || typeof admin !== 'object') {
    return null;
  }

  const email = (admin as { email?: unknown }).email;
  if (typeof email !== 'string' || !email.trim()) {
    return null;
  }

  const name = (admin as { name?: unknown }).name;
  const id = (admin as { _id?: unknown })._id;

  return {
    _id: typeof id === 'string' ? id : undefined,
    email,
    name: typeof name === 'string' ? name : undefined,
  };
}

function normalizeDestination(input: unknown): Destination | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const destination = input as Destination;
  if (!destination.id || !destination.name || !destination.location) {
    return null;
  }

  return {
    _id: destination._id,
    id: destination.id,
    name: destination.name,
    location: destination.location,
    tours: destination.tours || '',
    description: destination.description || '',
    image: destination.image || '',
    gallery: Array.isArray(destination.gallery) ? destination.gallery : [],
    highlights: Array.isArray(destination.highlights) ? destination.highlights : [],
    price: destination.price || '',
    duration: destination.duration || '',
    expertTip: destination.expertTip || '',
    cuisine: destination.cuisine || '',
    whenToGo: destination.whenToGo || '',
    latitude: destination.latitude,
    longitude: destination.longitude,
  };
}

function destinationToFormState(destination: Destination): DestinationFormState {
  return {
    id: destination.id,
    name: destination.name,
    location: destination.location,
    tours: destination.tours || '',
    description: destination.description || '',
    image: destination.image || '',
    highlights: (destination.highlights || []).join('\n'),
    price: destination.price || '',
    duration: destination.duration || '',
    expertTip: destination.expertTip || '',
    cuisine: destination.cuisine || '',
    whenToGo: destination.whenToGo || '',
    latitude: destination.latitude?.toString() || '',
    longitude: destination.longitude?.toString() || '',
  };
}

function linesToArray(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-lux-bg text-lux-primary flex items-center justify-center px-6">
      <div className="flex items-center gap-3 rounded-sm border border-lux-primary/10 bg-white px-5 py-4 shadow-sm">
        <LoaderCircle className="h-5 w-5 animate-spin text-lux-accent" />
        <span className="text-sm font-medium">Checking admin session...</span>
      </div>
    </div>
  );
}

function LoginPage({
  onLogin,
  isSubmitting,
  error,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
  error: string;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="admin-login">
      <div className="admin-login__bg" />
      <div className="admin-login__shell">
        <div className="admin-login__grid">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="admin-login__panel admin-login__panel--form"
          >
            <div className="admin-login__form-head">
              <div className="admin-login__icon">
                <Lock className="admin-login__icon-svg" />
              </div>
              <p className="admin-login__kicker">Admin Sign In</p>
              <h2 className="admin-login__title">Login required</h2>
              <p className="admin-login__copy">
                Enter your admin email and password to access the dashboard.
              </p>
            </div>

            <form className="admin-login__form" onSubmit={handleSubmit}>
              <label className="admin-login__field">
                <span className="admin-login__label">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="admin-login__input"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="admin-login__field">
                <span className="admin-login__label">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="admin-login__input"
                  autoComplete="current-password"
                  required
                />
              </label>

              {error ? (
                <div className="admin-login__error">
                  <AlertCircle className="admin-login__error-icon" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button type="submit" disabled={isSubmitting} className="admin-login__button">
                {isSubmitting ? <LoaderCircle className="admin-login__button-icon admin-login__button-icon--spin" /> : <Lock className="admin-login__button-icon" />}
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState([
    { label: 'Destinations', value: '0', helper: 'Published travel places', icon: MapPin },
    { label: 'Tour Packages', value: '0', helper: 'Available package entries', icon: Package },
    { label: 'Blog Posts', value: '0', helper: 'SEO content articles', icon: BookOpen },
    { label: 'Rental Vehicles', value: '0', helper: 'Cars and jeeps in fleet', icon: Car },
  ]);
  const [moduleSummary, setModuleSummary] = useState<{ label: string; count: string; note: string }[]>([]);

  useEffect(() => {
    const loadDashboardOverview = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [
          destinationsResponse,
          packagesResponse,
          blogsResponse,
          rentalsResponse,
          heroesResponse,
          teamResponse,
          testimonialsResponse,
          quotesResponse,
        ] = await Promise.all([
          fetch(getApiUrl('/api/destinations?page=1'), { credentials: 'include' }),
          fetch(getApiUrl('/api/tour-packages?page=1'), { credentials: 'include' }),
          fetch(getApiUrl('/api/blogs?page=1'), { credentials: 'include' }),
          fetch(getApiUrl('/api/rental-vehicles'), { credentials: 'include' }),
          fetch(getApiUrl('/api/heroes'), { credentials: 'include' }),
          fetch(getApiUrl('/api/team-members'), { credentials: 'include' }),
          fetch(getApiUrl('/api/testimonials'), { credentials: 'include' }),
          fetch(getApiUrl('/api/quotes'), { credentials: 'include' }),
        ]);

        const [
          destinationsData,
          packagesData,
          blogsData,
          rentalsData,
          heroesData,
          teamData,
          testimonialsData,
          quotesData,
        ] = await Promise.all([
          parseJsonSafely(destinationsResponse),
          parseJsonSafely(packagesResponse),
          parseJsonSafely(blogsResponse),
          parseJsonSafely(rentalsResponse),
          parseJsonSafely(heroesResponse),
          parseJsonSafely(teamResponse),
          parseJsonSafely(testimonialsResponse),
          parseJsonSafely(quotesResponse),
        ]);

        const destinationsCount = Number(destinationsData?.totalItems ?? destinationsData?.count ?? 0);
        const packagesCount = Number(packagesData?.totalItems ?? packagesData?.count ?? 0);
        const blogsCount = Number(blogsData?.totalItems ?? blogsData?.count ?? 0);
        const rentalsCount = Number(rentalsData?.count ?? 0);
        const heroesCount = Number(heroesData?.count ?? 0);
        const teamCount = Number(teamData?.count ?? 0);
        const testimonialsCount = Number(testimonialsData?.count ?? 0);
        const quotesCount = Number(quotesData?.count ?? 0);

        setStats([
          { label: 'Destinations', value: String(destinationsCount), helper: 'Published travel places', icon: MapPin },
          { label: 'Tour Packages', value: String(packagesCount), helper: 'Available package entries', icon: Package },
          { label: 'Blog Posts', value: String(blogsCount), helper: 'SEO content articles', icon: BookOpen },
          { label: 'Rental Vehicles', value: String(rentalsCount), helper: 'Cars and jeeps in fleet', icon: Car },
        ]);

        setModuleSummary([
          { label: 'Hero Slides', count: String(heroesCount), note: 'Homepage visual slides' },
          { label: 'Team Members', count: String(teamCount), note: 'About page profiles' },
          { label: 'Testimonials', count: String(testimonialsCount), note: 'Social proof content' },
          { label: 'Quote Requests', count: String(quotesCount), note: 'Contact leads received' },
        ]);
      } catch {
        setError('Unable to load dashboard data right now.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardOverview();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="group relative overflow-hidden border border-lux-primary/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-lux-accent/30 lg:p-6 rounded-lg">
              <div className="absolute right-0 top-0 -z-10 h-24 w-24 rounded-bl-full bg-lux-bg transition-transform duration-500 group-hover:scale-110" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-lux-primary/60 sm:text-xs">{stat.label}</p>
                  <h3 className="font-headings text-3xl lg:text-4xl font-bold text-lux-primary">{stat.value}</h3>
                </div>
                <div className="rounded-lg bg-lux-accent/10 p-3 text-lux-accent transition-colors group-hover:bg-lux-accent/20">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-lux-primary/55">{stat.helper}</p>
            </div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-4 font-headings text-2xl lg:text-3xl">
              <span className="hidden h-px w-8 bg-gradient-to-r from-lux-accent to-transparent sm:block" />
              Content Overview
            </h3>
            <p className="mt-2 text-sm text-lux-primary/50 ml-12">Real-time statistics from your backend</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-lux-accent/5 border border-lux-accent/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lux-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lux-accent"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-lux-accent">Live Data</span>
            <ArrowUpRight className="h-4 w-4 text-lux-accent" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center px-6 py-20 text-sm text-lux-primary/70 border border-lux-primary/10 bg-white rounded-xl shadow-sm">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" />
            Loading dashboard content...
          </div>
        ) : error ? (
          <div className="px-6 py-20 text-center text-sm text-rose-700 border border-rose-200 bg-rose-50 rounded-xl">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {moduleSummary.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group relative overflow-hidden border border-lux-primary/10 bg-white p-8 shadow-sm hover:shadow-xl hover:border-lux-accent/30 transition-all duration-500 rounded-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lux-accent/5 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-lux-primary/50 mb-4">{item.label}</p>
                  <div className="font-headings text-5xl font-bold text-lux-primary mb-3">{item.count}</div>
                  <p className="text-sm text-lux-primary/60 leading-relaxed">{item.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && !error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          >
            <div className="group relative overflow-hidden border border-lux-primary/10 bg-gradient-to-br from-white via-lux-bg/20 to-lux-bg/40 p-8 shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-lux-accent/10 to-transparent rounded-bl-full transform translate-x-12 -translate-y-12 group-hover:scale-125 transition-transform duration-700" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-xl bg-lux-accent/10 p-4 shadow-inner">
                    <LayoutDashboard className="h-6 w-6 text-lux-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-lux-accent">Dashboard</p>
                    <h4 className="mt-1 font-headings text-xl">Real-time Overview</h4>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-lux-primary/60">
                  This dashboard displays live data from your backend APIs. All statistics update in real-time as you manage your content across destinations, tours, blogs, and more.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden border border-lux-primary/10 bg-gradient-to-br from-white via-lux-bg/20 to-lux-bg/40 p-8 shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-lux-accent/10 to-transparent rounded-bl-full transform translate-x-12 -translate-y-12 group-hover:scale-125 transition-transform duration-700" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-xl bg-lux-accent/10 p-4 shadow-inner">
                    <Briefcase className="h-6 w-6 text-lux-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-lux-accent">Top Modules</p>
                    <h4 className="mt-1 font-headings text-xl">Most Managed Areas</h4>
                  </div>
                </div>
                <div className="space-y-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex items-center justify-between py-3 border-b border-lux-primary/5 last:border-0 hover:border-lux-accent/20 transition-colors">
                        <span className="text-lux-primary/70 flex items-center gap-3 text-sm">
                          <Icon className="h-5 w-5 text-lux-accent/60" />
                          {stat.label}
                        </span>
                        <span className="font-bold text-lux-primary bg-gradient-to-r from-lux-accent/10 to-lux-accent/5 px-4 py-1.5 rounded-full text-sm border border-lux-accent/10">{stat.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}

type Testimonial = {
  _id: string;
  quote: string;
  name: string;
  location: string;
  image: string;
};

type TestimonialFormState = {
  quote: string;
  name: string;
  location: string;
  image: string;
};

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string[];
  displayOrder: number;
};

type TeamMemberFormState = {
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string;
  displayOrder: string;
};

type Blog = {
  _id?: string;
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  image?: string;
  category?: string;
  author?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishedAt?: string;
};

type BlogFormState = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  publishedAt: string;
};

type RentalVehicle = {
  _id?: string;
  id: string;
  name: string;
  type?: string;
  price?: string;
  image?: string;
  description?: string;
  seats?: string;
  transmission?: string;
  fuelType?: string;
  withDriver?: boolean;
  features?: string[];
  displayOrder?: number;
};

type RentalVehicleFormState = {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  description: string;
  seats: string;
  transmission: string;
  fuelType: string;
  withDriver: boolean;
  features: string;
  displayOrder: string;
};

const EMPTY_TESTIMONIAL_FORM: TestimonialFormState = {
  quote: '',
  name: '',
  location: '',
  image: '',
};

const EMPTY_TEAM_MEMBER_FORM: TeamMemberFormState = {
  name: '',
  role: '',
  bio: '',
  image: '',
  specialties: '',
  displayOrder: '0',
};

const EMPTY_BLOG_FORM: BlogFormState = {
  id: '',
  title: '',
  excerpt: '',
  content: '',
  image: '',
  category: '',
  author: '',
  tags: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  publishedAt: '',
};

const EMPTY_RENTAL_VEHICLE_FORM: RentalVehicleFormState = {
  id: '',
  name: '',
  type: '',
  price: '',
  image: '',
  description: '',
  seats: '',
  transmission: '',
  fuelType: '',
  withDriver: false,
  features: '',
  displayOrder: '0',
};

function normalizeTestimonial(input: unknown): Testimonial | null {
  if (!input || typeof input !== 'object') return null;
  const t = input as Testimonial;
  if (!t._id || !t.quote || !t.name) return null;
  return { _id: t._id, quote: t.quote, name: t.name, location: t.location || '', image: t.image || '' };
}

function normalizeTeamMember(input: unknown): TeamMember | null {
  if (!input || typeof input !== 'object') return null;
  const member = input as TeamMember;
  if (!member._id || !member.name || !member.role) return null;
  return {
    _id: member._id,
    name: member.name,
    role: member.role,
    bio: member.bio || '',
    image: member.image || '',
    specialties: Array.isArray(member.specialties) ? member.specialties : [],
    displayOrder: Number.isFinite(Number(member.displayOrder)) ? Number(member.displayOrder) : 0,
  };
}

function normalizeBlog(input: unknown): Blog | null {
  if (!input || typeof input !== 'object') return null;
  const blog = input as Blog;
  if (!blog.id || !blog.title || !blog.content) return null;
  return {
    _id: blog._id,
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt || '',
    content: blog.content,
    image: blog.image || '',
    category: blog.category || '',
    author: blog.author || '',
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    seoTitle: blog.seoTitle || '',
    seoDescription: blog.seoDescription || '',
    seoKeywords: blog.seoKeywords || '',
    publishedAt: blog.publishedAt || '',
  };
}

function blogToFormState(blog: Blog): BlogFormState {
  return {
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt || '',
    content: blog.content,
    image: blog.image || '',
    category: blog.category || '',
    author: blog.author || '',
    tags: (blog.tags || []).join('\n'),
    seoTitle: blog.seoTitle || '',
    seoDescription: blog.seoDescription || '',
    seoKeywords: blog.seoKeywords || '',
    publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : '',
  };
}

function normalizeRentalVehicle(input: unknown): RentalVehicle | null {
  if (!input || typeof input !== 'object') return null;
  const vehicle = input as RentalVehicle;
  if (!vehicle.id || !vehicle.name) return null;
  return {
    _id: vehicle._id,
    id: vehicle.id,
    name: vehicle.name,
    type: vehicle.type || '',
    price: vehicle.price || '',
    image: vehicle.image || '',
    description: vehicle.description || '',
    seats: vehicle.seats || '',
    transmission: vehicle.transmission || '',
    fuelType: vehicle.fuelType || '',
    withDriver: Boolean(vehicle.withDriver),
    features: Array.isArray(vehicle.features) ? vehicle.features : [],
    displayOrder: Number.isFinite(Number(vehicle.displayOrder)) ? Number(vehicle.displayOrder) : 0,
  };
}

function rentalVehicleToFormState(vehicle: RentalVehicle): RentalVehicleFormState {
  return {
    id: vehicle.id,
    name: vehicle.name,
    type: vehicle.type || '',
    price: vehicle.price || '',
    image: vehicle.image || '',
    description: vehicle.description || '',
    seats: vehicle.seats || '',
    transmission: vehicle.transmission || '',
    fuelType: vehicle.fuelType || '',
    withDriver: Boolean(vehicle.withDriver),
    features: (vehicle.features || []).join('\n'),
    displayOrder: String(vehicle.displayOrder ?? 0),
  };
}

type JeepSafariItineraryStep = {
  day?: string;
  title: string;
  description?: string;
};

type JeepSafari = {
  _id?: string;
  id: string;
  name: string;
  region?: string;
  duration?: string;
  pricePerPerson?: string;
  pricePerJeep?: string;
  image?: string;
  gallery?: string[];
  description?: string;
  category?: string;
  difficulty?: string;
  vehicleType?: string;
  maxGroupSize?: string;
  bestSeason?: string;
  startLocation?: string;
  endLocation?: string;
  meetingPoint?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  itinerary?: JeepSafariItineraryStep[];
  nearbyAttractions?: string[];
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  displayOrder?: number;
};

type JeepSafariFormState = {
  id: string;
  name: string;
  region: string;
  duration: string;
  pricePerPerson: string;
  pricePerJeep: string;
  image: string;
  description: string;
  category: string;
  difficulty: string;
  vehicleType: string;
  maxGroupSize: string;
  bestSeason: string;
  startLocation: string;
  endLocation: string;
  meetingPoint: string;
  highlights: string;
  includes: string;
  excludes: string;
  itinerary: string;
  nearbyAttractions: string;
  latitude: string;
  longitude: string;
  featured: boolean;
  displayOrder: string;
};

const EMPTY_JEEP_SAFARI_FORM: JeepSafariFormState = {
  id: '',
  name: '',
  region: '',
  duration: '',
  pricePerPerson: '',
  pricePerJeep: '',
  image: '',
  description: '',
  category: '',
  difficulty: '',
  vehicleType: '',
  maxGroupSize: '',
  bestSeason: '',
  startLocation: '',
  endLocation: '',
  meetingPoint: '',
  highlights: '',
  includes: '',
  excludes: '',
  itinerary: '',
  nearbyAttractions: '',
  latitude: '',
  longitude: '',
  featured: false,
  displayOrder: '0',
};

function normalizeJeepSafari(input: unknown): JeepSafari | null {
  if (!input || typeof input !== 'object') return null;
  const s = input as JeepSafari;
  if (!s.id || !s.name) return null;
  return {
    _id: s._id,
    id: s.id,
    name: s.name,
    region: s.region || '',
    duration: s.duration || '',
    pricePerPerson: s.pricePerPerson || '',
    pricePerJeep: s.pricePerJeep || '',
    image: s.image || '',
    gallery: Array.isArray(s.gallery) ? s.gallery : [],
    description: s.description || '',
    category: s.category || '',
    difficulty: s.difficulty || '',
    vehicleType: s.vehicleType || '',
    maxGroupSize: s.maxGroupSize || '',
    bestSeason: s.bestSeason || '',
    startLocation: s.startLocation || '',
    endLocation: s.endLocation || '',
    meetingPoint: s.meetingPoint || '',
    highlights: Array.isArray(s.highlights) ? s.highlights : [],
    includes: Array.isArray(s.includes) ? s.includes : [],
    excludes: Array.isArray(s.excludes) ? s.excludes : [],
    itinerary: Array.isArray(s.itinerary) ? s.itinerary : [],
    nearbyAttractions: Array.isArray(s.nearbyAttractions) ? s.nearbyAttractions : [],
    latitude: Number.isFinite(Number(s.latitude)) ? Number(s.latitude) : undefined,
    longitude: Number.isFinite(Number(s.longitude)) ? Number(s.longitude) : undefined,
    featured: Boolean(s.featured),
    displayOrder: Number.isFinite(Number(s.displayOrder)) ? Number(s.displayOrder) : 0,
  };
}

function jeepSafariToFormState(s: JeepSafari): JeepSafariFormState {
  return {
    id: s.id,
    name: s.name,
    region: s.region || '',
    duration: s.duration || '',
    pricePerPerson: s.pricePerPerson || '',
    pricePerJeep: s.pricePerJeep || '',
    image: s.image || '',
    description: s.description || '',
    category: s.category || '',
    difficulty: s.difficulty || '',
    vehicleType: s.vehicleType || '',
    maxGroupSize: s.maxGroupSize || '',
    bestSeason: s.bestSeason || '',
    startLocation: s.startLocation || '',
    endLocation: s.endLocation || '',
    meetingPoint: s.meetingPoint || '',
    highlights: (s.highlights || []).join('\n'),
    includes: (s.includes || []).join('\n'),
    excludes: (s.excludes || []).join('\n'),
    itinerary: (s.itinerary || [])
      .map((step) => `${step.day || ''} | ${step.title} | ${step.description || ''}`)
      .join('\n'),
    nearbyAttractions: (s.nearbyAttractions || []).join('\n'),
    latitude: s.latitude !== undefined ? String(s.latitude) : '',
    longitude: s.longitude !== undefined ? String(s.longitude) : '',
    featured: Boolean(s.featured),
    displayOrder: String(s.displayOrder ?? 0),
  };
}

function parseItineraryFromText(text: string): JeepSafariItineraryStep[] {
  if (!text || !text.trim()) return [];
  return text
    .split('\n')
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length === 1) {
        return parts[0] ? { day: '', title: parts[0], description: '' } : null;
      }
      const title = parts[1] || parts[0];
      if (!title) return null;
      return {
        day: parts[0] || '',
        title,
        description: parts.slice(2).join(' | ').trim(),
      };
    })
    .filter(Boolean) as JeepSafariItineraryStep[];
}

type TourGuide = {
  _id?: string;
  id: string;
  name: string;
  image?: string;
  gallery?: string[];
  shortBio?: string;
  bio?: string;
  experience?: string;
  pricePerDay?: string;
  languages?: string[];
  specialties?: string[];
  category?: string;
  region?: string;
  baseCity?: string;
  certifications?: string[];
  rating?: number;
  totalTrips?: number;
  phoneNumber?: string;
  email?: string;
  whatsapp?: string;
  available?: boolean;
  featured?: boolean;
  displayOrder?: number;
};

type TourGuideFormState = {
  id: string;
  name: string;
  image: string;
  shortBio: string;
  bio: string;
  experience: string;
  pricePerDay: string;
  languages: string;
  specialties: string;
  category: string;
  region: string;
  baseCity: string;
  certifications: string;
  rating: string;
  totalTrips: string;
  phoneNumber: string;
  email: string;
  whatsapp: string;
  available: boolean;
  featured: boolean;
  displayOrder: string;
};

const EMPTY_TOUR_GUIDE_FORM: TourGuideFormState = {
  id: '',
  name: '',
  image: '',
  shortBio: '',
  bio: '',
  experience: '',
  pricePerDay: '',
  languages: '',
  specialties: '',
  category: '',
  region: '',
  baseCity: '',
  certifications: '',
  rating: '',
  totalTrips: '',
  phoneNumber: '',
  email: '',
  whatsapp: '',
  available: true,
  featured: false,
  displayOrder: '0',
};

function normalizeTourGuide(input: unknown): TourGuide | null {
  if (!input || typeof input !== 'object') return null;
  const g = input as TourGuide;
  if (!g.id || !g.name) return null;
  return {
    _id: g._id,
    id: g.id,
    name: g.name,
    image: g.image || '',
    gallery: Array.isArray(g.gallery) ? g.gallery : [],
    shortBio: g.shortBio || '',
    bio: g.bio || '',
    experience: g.experience || '',
    pricePerDay: g.pricePerDay || '',
    languages: Array.isArray(g.languages) ? g.languages : [],
    specialties: Array.isArray(g.specialties) ? g.specialties : [],
    category: g.category || '',
    region: g.region || '',
    baseCity: g.baseCity || '',
    certifications: Array.isArray(g.certifications) ? g.certifications : [],
    rating: Number.isFinite(Number(g.rating)) ? Number(g.rating) : 0,
    totalTrips: Number.isFinite(Number(g.totalTrips)) ? Number(g.totalTrips) : 0,
    phoneNumber: g.phoneNumber || '',
    email: g.email || '',
    whatsapp: g.whatsapp || '',
    available: g.available !== false,
    featured: Boolean(g.featured),
    displayOrder: Number.isFinite(Number(g.displayOrder)) ? Number(g.displayOrder) : 0,
  };
}

function tourGuideToFormState(g: TourGuide): TourGuideFormState {
  return {
    id: g.id,
    name: g.name,
    image: g.image || '',
    shortBio: g.shortBio || '',
    bio: g.bio || '',
    experience: g.experience || '',
    pricePerDay: g.pricePerDay || '',
    languages: (g.languages || []).join('\n'),
    specialties: (g.specialties || []).join('\n'),
    category: g.category || '',
    region: g.region || '',
    baseCity: g.baseCity || '',
    certifications: (g.certifications || []).join('\n'),
    rating: g.rating !== undefined ? String(g.rating) : '',
    totalTrips: g.totalTrips !== undefined ? String(g.totalTrips) : '',
    phoneNumber: g.phoneNumber || '',
    email: g.email || '',
    whatsapp: g.whatsapp || '',
    available: g.available !== false,
    featured: Boolean(g.featured),
    displayOrder: String(g.displayOrder ?? 0),
  };
}

type HotelRoom = {
  name: string;
  description?: string;
  price?: string;
  image?: string;
  capacity?: string;
  beds?: string;
  size?: string;
  amenities?: string[];
};

type Hotel = {
  _id?: string;
  id: string;
  name: string;
  location: string;
  address?: string;
  category?: string;
  rating?: number;
  description?: string;
  image?: string;
  gallery?: string[];
  priceFrom?: string;
  amenities?: string[];
  rooms?: HotelRoom[];
  policies?: string;
  checkIn?: string;
  checkOut?: string;
  nearbyAttractions?: string[];
  phoneNumber?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  displayOrder?: number;
};

type HotelRoomFormState = {
  name: string;
  description: string;
  price: string;
  image: string;
  capacity: string;
  beds: string;
  size: string;
  amenities: string;
};

type HotelFormState = {
  id: string;
  name: string;
  location: string;
  address: string;
  category: string;
  rating: string;
  description: string;
  image: string;
  priceFrom: string;
  amenities: string;
  rooms: HotelRoomFormState[];
  policies: string;
  checkIn: string;
  checkOut: string;
  nearbyAttractions: string;
  phoneNumber: string;
  email: string;
  website: string;
  latitude: string;
  longitude: string;
  featured: boolean;
  displayOrder: string;
};

const EMPTY_HOTEL_ROOM_FORM: HotelRoomFormState = {
  name: '',
  description: '',
  price: '',
  image: '',
  capacity: '',
  beds: '',
  size: '',
  amenities: '',
};

const EMPTY_HOTEL_FORM: HotelFormState = {
  id: '',
  name: '',
  location: '',
  address: '',
  category: '',
  rating: '',
  description: '',
  image: '',
  priceFrom: '',
  amenities: '',
  rooms: [],
  policies: '',
  checkIn: '',
  checkOut: '',
  nearbyAttractions: '',
  phoneNumber: '',
  email: '',
  website: '',
  latitude: '',
  longitude: '',
  featured: false,
  displayOrder: '0',
};

function normalizeHotel(input: unknown): Hotel | null {
  if (!input || typeof input !== 'object') return null;
  const hotel = input as Hotel;
  if (!hotel.id || !hotel.name || !hotel.location) return null;
  return {
    _id: hotel._id,
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    address: hotel.address || '',
    category: hotel.category || '',
    rating: Number.isFinite(Number(hotel.rating)) ? Number(hotel.rating) : 0,
    description: hotel.description || '',
    image: hotel.image || '',
    gallery: Array.isArray(hotel.gallery) ? hotel.gallery : [],
    priceFrom: hotel.priceFrom || '',
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
    rooms: Array.isArray(hotel.rooms) ? hotel.rooms : [],
    policies: hotel.policies || '',
    checkIn: hotel.checkIn || '',
    checkOut: hotel.checkOut || '',
    nearbyAttractions: Array.isArray(hotel.nearbyAttractions) ? hotel.nearbyAttractions : [],
    phoneNumber: hotel.phoneNumber || '',
    email: hotel.email || '',
    website: hotel.website || '',
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    featured: Boolean(hotel.featured),
    displayOrder: Number.isFinite(Number(hotel.displayOrder)) ? Number(hotel.displayOrder) : 0,
  };
}

function hotelToFormState(hotel: Hotel): HotelFormState {
  return {
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    address: hotel.address || '',
    category: hotel.category || '',
    rating: hotel.rating ? String(hotel.rating) : '',
    description: hotel.description || '',
    image: hotel.image || '',
    priceFrom: hotel.priceFrom || '',
    amenities: (hotel.amenities || []).join('\n'),
    rooms: (hotel.rooms || []).map((room) => ({
      name: room.name || '',
      description: room.description || '',
      price: room.price || '',
      image: room.image || '',
      capacity: room.capacity || '',
      beds: room.beds || '',
      size: room.size || '',
      amenities: (room.amenities || []).join('\n'),
    })),
    policies: hotel.policies || '',
    checkIn: hotel.checkIn || '',
    checkOut: hotel.checkOut || '',
    nearbyAttractions: (hotel.nearbyAttractions || []).join('\n'),
    phoneNumber: hotel.phoneNumber || '',
    email: hotel.email || '',
    website: hotel.website || '',
    latitude: hotel.latitude !== undefined ? String(hotel.latitude) : '',
    longitude: hotel.longitude !== undefined ? String(hotel.longitude) : '',
    featured: Boolean(hotel.featured),
    displayOrder: String(hotel.displayOrder ?? 0),
  };
}

type HeroSlide = {
  _id: string;
  heading: string;
  subheading: string;
  description: string;
  backgroundImage: string;
};

type HeroFormState = {
  heading: string;
  subheading: string;
  description: string;
  backgroundImage: string;
};

const EMPTY_HERO_FORM: HeroFormState = { heading: '', subheading: '', description: '', backgroundImage: '' };

function normalizeHero(input: unknown): HeroSlide | null {
  if (!input || typeof input !== 'object') return null;
  const h = input as HeroSlide;
  if (!h._id || !h.heading) return null;
  return { _id: h._id, heading: h.heading, subheading: h.subheading || '', description: h.description || '', backgroundImage: h.backgroundImage || '' };
}

function HeroManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<HeroFormState>(EMPTY_HERO_FORM);

  const loadSlides = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/heroes'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to load hero slides.'); setSlides([]); return; }
      setSlides((Array.isArray(data?.data) ? data.data.map(normalizeHero).filter(Boolean) : []) as HeroSlide[]);
    } catch {
      setError('Unable to fetch hero slides.');
      setSlides([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadSlides(); }, []);

  const updateField = (field: keyof HeroFormState, value: string) =>
    setForm((cur) => ({ ...cur, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_HERO_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setIsFormOpen(false);
  };

  const startEditing = (h: HeroSlide) => {
    setForm({ heading: h.heading, subheading: h.subheading, description: h.description, backgroundImage: h.backgroundImage });
    setEditingId(h._id);
    setSelectedImage(null);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitSlide = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('heading', form.heading.trim());
      payload.append('subheading', form.subheading.trim());
      payload.append('description', form.description.trim());
      payload.append('backgroundImage', form.backgroundImage.trim());
      if (selectedImage) payload.set('backgroundImage', selectedImage);

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/heroes/${editingId}` : '/api/heroes'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload }
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to save hero slide.'); return; }
      setSuccessMessage(isEditing ? 'Hero slide updated successfully.' : 'Hero slide created successfully.');
      resetForm();
      await loadSlides();
    } catch {
      setError('Unable to save hero slide right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeSlide = async (id: string) => {
    if (!window.confirm('Delete this hero slide?')) return;
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(getApiUrl(`/api/heroes/${id}`), { method: 'DELETE', credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to delete hero slide.'); return; }
      setSuccessMessage('Hero slide deleted successfully.');
      if (editingId === id) resetForm();
      await loadSlides();
    } catch {
      setError('Unable to delete hero slide right now.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Hero Slider API</p>
              <h3 className="mt-2 font-headings text-2xl">Hero Slide Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">Connected to `GET /api/heroes`, `POST /api/heroes`, `PUT /api/heroes/:id`, `DELETE /api/heroes/:id`.</p>
            </div>
            <button type="button" onClick={() => { setForm(EMPTY_HERO_FORM); setEditingId(null); setSelectedImage(null); setError(''); setSuccessMessage(''); setIsFormOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
              <Plus className="h-4 w-4" /> New Slide
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitSlide}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Hero Slide' : 'Create Hero Slide'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">Each slide appears in the homepage hero slider.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Heading</span>
              <input value={form.heading} onChange={(e) => updateField('heading', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Discover the World, Make Memories" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Subheading</span>
              <input value={form.subheading} onChange={(e) => updateField('subheading', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Curated Experiences" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Background Image URL</span>
              <input value={form.backgroundImage} onChange={(e) => updateField('backgroundImage', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Background Image</span>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description</span>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Explore amazing destinations curated just for you..." />
            </label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{error}</span></div> : null}
                {successMessage ? <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Slide' : 'Create Slide'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">
            Click <span className="font-bold text-lux-primary">New Slide</span> to add a hero banner slide.
          </div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Hero Slides</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Slides appear in order on the homepage hero slider.</p>
          </div>
          <button type="button" onClick={() => void loadSlides()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading slides...
          </div>
        ) : slides.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No hero slides yet. Add your first slide above.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {slides.map((slide, idx) => (
              <article key={slide._id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url('${slide.backgroundImage}')` }}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-3 left-3 bg-lux-primary/80 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">Slide {idx + 1}</div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-[10px] uppercase tracking-widest text-lux-accent mb-1">{slide.subheading || '—'}</div>
                    <div className="font-headings text-xl">{slide.heading}</div>
                  </div>
                </div>
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <p className="text-sm text-lux-primary/65 flex-1">{slide.description || 'No description.'}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => startEditing(slide)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => void removeSlide(slide._id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

type PromoModalData = {
  image: string;
  subtitle: string;
  title: string;
  description: string;
  isActive: boolean;
};

const EMPTY_PROMO_FORM: PromoModalData = {
  image: '',
  subtitle: '',
  title: '',
  description: '',
  isActive: true,
};

function PromoModalManager() {
  const [form, setForm] = useState<PromoModalData>(EMPTY_PROMO_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const loadPromo = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/promo-modal'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to load promo modal settings.'); return; }
      if (data?.data) {
        setForm({
          image: data.data.image || '',
          subtitle: data.data.subtitle || '',
          title: data.data.title || '',
          description: data.data.description || '',
          isActive: data.data.isActive !== undefined ? data.data.isActive : true,
        });
      }
    } catch {
      setError('Unable to fetch promo modal settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadPromo(); }, []);

  const updateField = (field: keyof PromoModalData, value: string | boolean) =>
    setForm((cur) => ({ ...cur, [field]: value }));

  const submitPromo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('subtitle', form.subtitle.trim());
      payload.append('title', form.title.trim());
      payload.append('description', form.description.trim());
      payload.append('isActive', form.isActive ? 'true' : 'false');
      payload.append('image', form.image.trim());
      if (selectedImage) payload.set('image', selectedImage);

      const response = await fetch(getApiUrl('/api/promo-modal'), {
        method: 'PUT',
        credentials: 'include',
        body: payload,
      });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to save promo modal settings.'); return; }
      setSuccessMessage('Promo modal updated successfully.');
      await loadPromo();
      setSelectedImage(null);
    } catch {
      setError('Unable to save promo modal right now.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading promo modal settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div>
            <h3 className="font-headings text-2xl">Promo Modal Settings</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Manage the promotional popup that appears when users visit the website.</p>
          </div>
        </div>

        <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitPromo}>
          <label className="block lg:col-span-2 flex items-center gap-3">
            <input type="checkbox" checked={form.isActive} onChange={(e) => updateField('isActive', e.target.checked)} className="h-4 w-4 rounded border-lux-primary/20 text-lux-accent focus:ring-lux-accent" />
            <span className="text-sm font-bold tracking-widest text-lux-primary">Enable Promo Modal</span>
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Subtitle (Kicker)</span>
            <input value={form.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Special Offer" required />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Title</span>
            <input value={form.title} onChange={(e) => updateField('title', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Trending Packages" required />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Background Image URL</span>
            <input value={form.image} onChange={(e) => updateField('image', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Image</span>
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" />
          </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description</span>
            <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Unlock exclusive discounts..." required />
          </label>

          {(error || successMessage) ? (
            <div className="lg:col-span-2">
              {error ? <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{error}</span></div> : null}
              {successMessage ? <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
            </div>
          ) : null}

          <div className="lg:col-span-2">
            <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save Promo Modal
            </button>
          </div>
        </form>
      </motion.section>
    </div>
  );
}

function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<TestimonialFormState>(EMPTY_TESTIMONIAL_FORM);

  const loadTestimonials = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/testimonials'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to load testimonials.'); setTestimonials([]); return; }
      setTestimonials((Array.isArray(data?.data) ? data.data.map(normalizeTestimonial).filter(Boolean) : []) as Testimonial[]);
    } catch {
      setError('Unable to fetch testimonials from the backend.');
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadTestimonials(); }, []);

  const updateField = (field: keyof TestimonialFormState, value: string) =>
    setForm((cur) => ({ ...cur, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_TESTIMONIAL_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setIsFormOpen(false);
  };

  const startEditing = (t: Testimonial) => {
    setForm({ quote: t.quote, name: t.name, location: t.location, image: t.image });
    setEditingId(t._id);
    setSelectedImage(null);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitTestimonial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('quote', form.quote.trim());
      payload.append('name', form.name.trim());
      payload.append('location', form.location.trim());
      payload.append('image', form.image.trim());
      if (selectedImage) payload.set('image', selectedImage);

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/testimonials/${editingId}` : '/api/testimonials'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload }
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to save testimonial.'); return; }
      setSuccessMessage(isEditing ? 'Testimonial updated successfully.' : 'Testimonial created successfully.');
      resetForm();
      await loadTestimonials();
    } catch {
      setError('Unable to save testimonial right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(getApiUrl(`/api/testimonials/${id}`), { method: 'DELETE', credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to delete testimonial.'); return; }
      setSuccessMessage('Testimonial deleted successfully.');
      if (editingId === id) resetForm();
      await loadTestimonials();
    } catch {
      setError('Unable to delete testimonial right now.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Testimonial API</p>
              <h3 className="mt-2 font-headings text-2xl">Testimonial Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">
                Connected to `GET /api/testimonials`, `POST /api/testimonials`, `PUT /api/testimonials/:id`, and `DELETE /api/testimonials/:id`.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setForm(EMPTY_TESTIMONIAL_FORM); setEditingId(null); setSelectedImage(null); setError(''); setSuccessMessage(''); setIsFormOpen(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
            >
              <Plus className="h-4 w-4" />
              New Testimonial
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitTestimonial}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Testimonial' : 'Create Testimonial'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">Fill all fields from the backend testimonial schema.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Name</span>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Sarah Johnson" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Location</span>
              <input value={form.location} onChange={(e) => updateField('location', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="New York, USA" />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Quote</span>
              <textarea value={form.quote} onChange={(e) => updateField('quote', e.target.value)} className="min-h-28 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="This was absolutely the best trip of my life..." required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Image URL</span>
              <input value={form.image} onChange={(e) => updateField('image', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Image</span>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" />
            </label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? (
                  <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}
                {successMessage ? (
                  <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">
            Click <span className="font-bold text-lux-primary">New Testimonial</span> to open the form.
          </div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Testimonials</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live data from the backend testimonial APIs.</p>
          </div>
          <button type="button" onClick={() => void loadTestimonials()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No testimonials found yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t._id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                <div className="border-b border-lux-primary/10 bg-lux-bg/60 px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-lux-primary/10 flex items-center justify-center text-lux-primary/40 text-sm font-bold">{t.name[0]}</div>
                    )}
                    <div>
                      <div className="font-bold text-sm">{t.name}</div>
                      <div className="text-xs text-lux-primary/55">{t.location || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEditing(t)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => void removeTestimonial(t._id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
                <div className="px-5 py-5 text-sm text-lux-primary/75">
                  <p className="italic">"{t.quote}"</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function TeamManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<TeamMemberFormState>(EMPTY_TEAM_MEMBER_FORM);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/team-members'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to load team members.');
        setTeamMembers([]);
        return;
      }
      setTeamMembers((Array.isArray(data?.data) ? data.data.map(normalizeTeamMember).filter(Boolean) : []) as TeamMember[]);
    } catch {
      setError('Unable to fetch team members from the backend.');
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadTeamMembers(); }, []);

  const updateField = (field: keyof TeamMemberFormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_TEAM_MEMBER_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setIsFormOpen(false);
  };

  const startEditing = (member: TeamMember) => {
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image: member.image,
      specialties: member.specialties.join('\n'),
      displayOrder: String(member.displayOrder ?? 0),
    });
    setEditingId(member._id);
    setSelectedImage(null);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitTeamMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('role', form.role.trim());
      payload.append('bio', form.bio.trim());
      payload.append('image', form.image.trim());
      payload.append('specialties', JSON.stringify(linesToArray(form.specialties)));
      payload.append('displayOrder', form.displayOrder.trim() || '0');
      if (selectedImage) payload.set('image', selectedImage);

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/team-members/${editingId}` : '/api/team-members'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload }
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save team member.');
        return;
      }
      setSuccessMessage(isEditing ? 'Team member updated successfully.' : 'Team member created successfully.');
      resetForm();
      await loadTeamMembers();
    } catch {
      setError('Unable to save team member right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeTeamMember = async (id: string) => {
    if (!window.confirm('Delete this team member?')) return;
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(getApiUrl(`/api/team-members/${id}`), { method: 'DELETE', credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to delete team member.');
        return;
      }
      setSuccessMessage('Team member deleted successfully.');
      if (editingId === id) resetForm();
      await loadTeamMembers();
    } catch {
      setError('Unable to delete team member right now.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Team API</p>
              <h3 className="mt-2 font-headings text-2xl">Team Member Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">
                Connected to `GET /api/team-members`, `POST /api/team-members`, `PUT /api/team-members/:id`, and `DELETE /api/team-members/:id`.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setForm(EMPTY_TEAM_MEMBER_FORM); setEditingId(null); setSelectedImage(null); setError(''); setSuccessMessage(''); setIsFormOpen(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
            >
              <Plus className="h-4 w-4" />
              New Team Member
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitTeamMember}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Team Member' : 'Create Team Member'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">Add the team profile that will appear on the About Us page.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Name</span>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Aqeel Ahmed" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Role</span>
              <input value={form.role} onChange={(e) => updateField('role', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Founder & Tour Director" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Image URL</span>
              <input value={form.image} onChange={(e) => updateField('image', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Display Order</span>
              <input type="number" value={form.displayOrder} onChange={(e) => updateField('displayOrder', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="0" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Image</span>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Specialties</span>
              <textarea value={form.specialties} onChange={(e) => updateField('specialties', e.target.value)} className="min-h-28 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="One specialty per line" />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Bio</span>
              <textarea value={form.bio} onChange={(e) => updateField('bio', e.target.value)} className="min-h-32 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Tell travelers about this team member..." />
            </label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? (
                  <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}
                {successMessage ? (
                  <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Team Member' : 'Create Team Member'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">
            Click <span className="font-bold text-lux-primary">New Team Member</span> to open the form.
          </div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Team Members</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live data used on the frontend About page.</p>
          </div>
          <button type="button" onClick={() => void loadTeamMembers()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading team members...
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No team members found yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <article key={member._id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                <div className="border-b border-lux-primary/10 bg-lux-bg/60 px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lux-primary/10 text-lg font-bold text-lux-primary/40">{member.name[0]}</div>
                      )}
                      <div>
                        <div className="font-bold text-sm">{member.name}</div>
                        <div className="text-xs text-lux-primary/55">{member.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => startEditing(member)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => void removeTeamMember(member._id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 px-5 py-5 text-sm text-lux-primary/75">
                  <p>{member.bio || 'No bio added yet.'}</p>
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-lux-primary/50">
                    <span>Display Order</span>
                    <span>{member.displayOrder}</span>
                  </div>
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Specialties</div>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.length > 0 ? (
                        member.specialties.map((item) => (
                          <span key={item} className="rounded-full bg-lux-bg px-3 py-1 text-[11px] text-lux-primary/75">{item}</span>
                        ))
                      ) : (
                        <span className="rounded-full bg-lux-bg px-3 py-1 text-[11px] text-lux-primary/55">No specialties added</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function BlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<BlogFormState>(EMPTY_BLOG_FORM);

  const loadBlogs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/blogs?page=1'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to load blogs.');
        setBlogs([]);
        return;
      }

      const totalPages = Math.max(Number(data?.totalPages) || 1, 1);
      let allBlogs = Array.isArray(data?.data) ? data.data : [];

      if (totalPages > 1) {
        for (let page = 2; page <= totalPages; page += 1) {
          const nextResponse = await fetch(getApiUrl(`/api/blogs?page=${page}`), { credentials: 'include' });
          const nextData = await parseJsonSafely(nextResponse);
          if (nextResponse.ok && Array.isArray(nextData?.data)) {
            allBlogs = [...allBlogs, ...nextData.data];
          }
        }
      }

      setBlogs(allBlogs.map(normalizeBlog).filter(Boolean) as Blog[]);
    } catch {
      setError('Unable to fetch blogs from the backend.');
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadBlogs(); }, []);

  const updateField = (field: keyof BlogFormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_BLOG_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setIsFormOpen(false);
  };

  const startEditing = (blog: Blog) => {
    setForm(blogToFormState(blog));
    setEditingId(blog.id);
    setSelectedImage(null);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitBlog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('id', form.id.trim());
      payload.append('title', form.title.trim());
      payload.append('excerpt', form.excerpt.trim());
      payload.append('content', form.content.trim());
      payload.append('image', form.image.trim());
      payload.append('category', form.category.trim());
      payload.append('author', form.author.trim());
      payload.append('tags', JSON.stringify(linesToArray(form.tags)));
      payload.append('seoTitle', form.seoTitle.trim());
      payload.append('seoDescription', form.seoDescription.trim());
      payload.append('seoKeywords', form.seoKeywords.trim());
      payload.append('publishedAt', form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString());
      if (selectedImage) payload.set('image', selectedImage);

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/blogs/${editingId}` : '/api/blogs'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload }
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save blog.');
        return;
      }
      setSuccessMessage(isEditing ? 'Blog updated successfully.' : 'Blog created successfully.');
      resetForm();
      await loadBlogs();
    } catch {
      setError('Unable to save blog right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeBlog = async (blogId: string) => {
    if (!window.confirm(`Delete blog "${blogId}"?`)) return;
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(getApiUrl(`/api/blogs/${blogId}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to delete blog.');
        return;
      }
      setSuccessMessage('Blog deleted successfully.');
      if (editingId === blogId) resetForm();
      await loadBlogs();
    } catch {
      setError('Unable to delete blog right now.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Blog API</p>
              <h3 className="mt-2 font-headings text-2xl">Blog Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">
                Write SEO-friendly blog posts from admin and publish them to the frontend.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setForm(EMPTY_BLOG_FORM); setEditingId(null); setSelectedImage(null); setError(''); setSuccessMessage(''); setIsFormOpen(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
            >
              <Plus className="h-4 w-4" />
              New Blog
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitBlog}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Blog' : 'Create Blog'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">Fill in the content and SEO fields for better search performance.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Blog ID / Slug</span>
              <input value={form.id} onChange={(e) => updateField('id', e.target.value)} disabled={Boolean(editingId)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="best-time-to-visit-hunza" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Title</span>
              <input value={form.title} onChange={(e) => updateField('title', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Best Time to Visit Hunza Valley" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Category</span>
              <input value={form.category} onChange={(e) => updateField('category', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Travel Guide" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Author</span>
              <input value={form.author} onChange={(e) => updateField('author', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="North Paradise Team" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Published At</span>
              <input type="datetime-local" value={form.publishedAt} onChange={(e) => updateField('publishedAt', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Image URL</span>
              <input value={form.image} onChange={(e) => updateField('image', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Image</span>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Excerpt</span>
              <textarea value={form.excerpt} onChange={(e) => updateField('excerpt', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="A short summary for blog cards and SEO..." />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Content</span>
              <textarea value={form.content} onChange={(e) => updateField('content', e.target.value)} className="min-h-56 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Write the full blog content here..." required />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Tags</span>
              <textarea value={form.tags} onChange={(e) => updateField('tags', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="One tag per line" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">SEO Title</span>
              <input value={form.seoTitle} onChange={(e) => updateField('seoTitle', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Custom SEO title" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">SEO Keywords</span>
              <input value={form.seoKeywords} onChange={(e) => updateField('seoKeywords', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="hunza travel, skardu guide, northern pakistan" />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">SEO Description</span>
              <textarea value={form.seoDescription} onChange={(e) => updateField('seoDescription', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="SEO description for search results..." />
            </label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{error}</span></div> : null}
                {successMessage ? <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Blog' : 'Create Blog'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">Click <span className="font-bold text-lux-primary">New Blog</span> to open the form.</div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Published Blogs</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live content from the backend blog APIs.</p>
          </div>
          <button type="button" onClick={() => void loadBlogs()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading blogs...
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No blogs found yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article key={blog.id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                {blog.image ? <img src={blog.image} alt={blog.title} className="h-48 w-full object-cover" /> : null}
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-lux-accent">{blog.category || 'Blog'}</div>
                      <h4 className="mt-2 font-headings text-xl">{blog.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-lux-primary/70">{blog.excerpt || 'No excerpt added.'}</p>
                  <div className="text-xs text-lux-primary/50">{blog.author || 'North Paradise Team'} {blog.publishedAt ? `• ${new Date(blog.publishedAt).toLocaleDateString()}` : ''}</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEditing(blog)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => void removeBlog(blog.id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function RentalVehicleManager() {
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<RentalVehicleFormState>(EMPTY_RENTAL_VEHICLE_FORM);

  const loadVehicles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/rental-vehicles'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to load rental vehicles.');
        setVehicles([]);
        return;
      }
      setVehicles((Array.isArray(data?.data) ? data.data.map(normalizeRentalVehicle).filter(Boolean) : []) as RentalVehicle[]);
    } catch {
      setError('Unable to fetch rental vehicles from the backend.');
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicleCategories = async () => {
    try {
      const response = await fetch(getApiUrl('/api/vehicle-categories'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (response.ok && Array.isArray(data?.data)) {
        setVehicleCategories(data.data.map((c: { _id: string; name: string }) => ({ _id: c._id, name: c.name })));
      }
    } catch {}
  };

  useEffect(() => {
    void loadVehicles();
    void loadVehicleCategories();
  }, []);

  const updateField = (field: keyof RentalVehicleFormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_RENTAL_VEHICLE_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setIsFormOpen(false);
  };

  const startEditing = (vehicle: RentalVehicle) => {
    setForm(rentalVehicleToFormState(vehicle));
    setEditingId(vehicle.id);
    setSelectedImage(null);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('id', form.id.trim());
      payload.append('name', form.name.trim());
      payload.append('type', form.type.trim());
      payload.append('price', form.price.trim());
      payload.append('image', form.image.trim());
      payload.append('description', form.description.trim());
      payload.append('seats', form.seats.trim());
      payload.append('transmission', form.transmission.trim());
      payload.append('fuelType', form.fuelType.trim());
      payload.append('withDriver', String(form.withDriver));
      payload.append('features', JSON.stringify(linesToArray(form.features)));
      payload.append('displayOrder', form.displayOrder.trim() || '0');
      if (selectedImage) payload.set('image', selectedImage);

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/rental-vehicles/${editingId}` : '/api/rental-vehicles'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload }
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save rental vehicle.');
        return;
      }
      setSuccessMessage(isEditing ? 'Rental vehicle updated successfully.' : 'Rental vehicle created successfully.');
      resetForm();
      await loadVehicles();
    } catch {
      setError('Unable to save rental vehicle right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeVehicle = async (vehicleId: string) => {
    if (!window.confirm(`Delete rental vehicle "${vehicleId}"?`)) return;
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(getApiUrl(`/api/rental-vehicles/${vehicleId}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to delete rental vehicle.');
        return;
      }
      setSuccessMessage('Rental vehicle deleted successfully.');
      if (editingId === vehicleId) resetForm();
      await loadVehicles();
    } catch {
      setError('Unable to delete rental vehicle right now.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Rental API</p>
              <h3 className="mt-2 font-headings text-2xl">Rental Vehicle Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">Manage the cars and jeeps shown on the Car / Jeep Rent service page.</p>
            </div>
            <button
              type="button"
              onClick={() => { setForm(EMPTY_RENTAL_VEHICLE_FORM); setEditingId(null); setSelectedImage(null); setError(''); setSuccessMessage(''); setIsFormOpen(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
            >
              <Plus className="h-4 w-4" />
              New Vehicle
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitVehicle}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Vehicle' : 'Create Vehicle'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">Add your rental cars and jeeps from the admin panel.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Vehicle ID</span><input value={form.id} onChange={(e) => updateField('id', e.target.value)} disabled={Boolean(editingId)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="toyota-prado" required /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Name</span><input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Toyota Prado" required /></label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Type / Category</span>
              {vehicleCategories.length > 0 ? (
                <select value={form.type} onChange={(e) => updateField('type', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent">
                  <option value="">Select category</option>
                  {vehicleCategories.map((c) => (<option key={c._id} value={c.name}>{c.name}</option>))}
                  {form.type && !vehicleCategories.some((c) => c.name === form.type) ? (
                    <option value={form.type}>{form.type} (legacy)</option>
                  ) : null}
                </select>
              ) : (
                <input value={form.type} onChange={(e) => updateField('type', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="4x4 Jeep / SUV / Sedan" />
              )}
            </label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Price</span><input value={form.price} onChange={(e) => updateField('price', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="PKR 18,000 / day" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Seats</span><input value={form.seats} onChange={(e) => updateField('seats', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="7 Seats" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Transmission</span><input value={form.transmission} onChange={(e) => updateField('transmission', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Automatic" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Fuel Type</span><input value={form.fuelType} onChange={(e) => updateField('fuelType', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Diesel" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Display Order</span><input type="number" value={form.displayOrder} onChange={(e) => updateField('displayOrder', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="0" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Image URL</span><input value={form.image} onChange={(e) => updateField('image', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Image</span><input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" /></label>
            <label className="block lg:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description</span><textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Describe this vehicle..." /></label>
            <label className="block lg:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Features</span><textarea value={form.features} onChange={(e) => updateField('features', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="One feature per line" /></label>
            <label className="flex items-center gap-3 lg:col-span-2"><input type="checkbox" checked={form.withDriver} onChange={(e) => updateField('withDriver', e.target.checked)} className="h-4 w-4" /><span className="text-sm text-lux-primary/70">Available with driver</span></label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{error}</span></div> : null}
                {successMessage ? <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Vehicle' : 'Create Vehicle'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">Click <span className="font-bold text-lux-primary">New Vehicle</span> to open the form.</div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Rental Vehicles</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live data for the Car / Jeep Rent service page.</p>
          </div>
          <button type="button" onClick={() => void loadVehicles()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading rental vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No rental vehicles found yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <article key={vehicle.id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                {vehicle.image ? <img src={vehicle.image} alt={vehicle.name} className="h-48 w-full object-cover" /> : null}
                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-lux-accent">{vehicle.type || 'Vehicle'}</div>
                    <h4 className="mt-2 font-headings text-xl">{vehicle.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-lux-primary/70">
                    <div><span className="font-bold text-lux-primary">Price:</span> {vehicle.price || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Seats:</span> {vehicle.seats || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Transmission:</span> {vehicle.transmission || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Fuel:</span> {vehicle.fuelType || '—'}</div>
                  </div>
                  <p className="text-sm text-lux-primary/70">{vehicle.description || 'No description added.'}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEditing(vehicle)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => void removeVehicle(vehicle.id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

type SimpleCategory = { _id: string; name: string; description?: string; displayOrder?: number };

function GenericCategoryPanel({
  endpoint,
  title,
  description,
  itemLabel,
  placeholder,
}: {
  endpoint: string;
  title: string;
  description: string;
  itemLabel: string;
  placeholder: string;
}) {
  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [name, setName] = useState('');
  const [descField, setDescField] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl(endpoint), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (response.ok && Array.isArray(data?.data)) setCategories(data.data);
      else setCategories([]);
    } catch {
      setError(`Failed to fetch ${itemLabel.toLowerCase()}s`);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadCategories(); }, []);

  const resetForm = () => {
    setName('');
    setDescField('');
    setDisplayOrder('0');
    setEditingId(null);
  };

  const startEditing = (category: SimpleCategory) => {
    setName(category.name);
    setDescField(category.description || '');
    setDisplayOrder(String(category.displayOrder ?? 0));
    setEditingId(category._id);
    setError('');
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `${endpoint}/${editingId}` : endpoint),
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: name.trim(),
            description: descField.trim(),
            displayOrder: Number(displayOrder) || 0,
          }),
        },
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || `Failed to save ${itemLabel.toLowerCase()}`);
        return;
      }
      setSuccessMessage(isEditing ? `${itemLabel} updated successfully` : `${itemLabel} added successfully`);
      resetForm();
      await loadCategories();
    } catch {
      setError('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemLabel.toLowerCase()}?`)) return;
    try {
      const response = await fetch(getApiUrl(`${endpoint}/${id}`), { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        setSuccessMessage('Deleted successfully');
        if (editingId === id) resetForm();
        await loadCategories();
      } else {
        const data = await parseJsonSafely(response);
        setError(data?.message || 'Failed to delete');
      }
    } catch {
      setError('Failed to delete');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">{itemLabel} API</p>
          <h3 className="mt-2 font-headings text-2xl">{title}</h3>
          <p className="mt-2 text-sm text-lux-primary/65">{description}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">{itemLabel} Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder={placeholder} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Display Order</span>
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="0" />
            </label>
            <label className="block sm:col-span-3">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description (Optional)</span>
              <input value={descField} onChange={(e) => setDescField(e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Short description" />
            </label>
          </div>
          {error && <div className="flex items-start gap-2 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"><AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /><span>{error}</span></div>}
          {successMessage && <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{successMessage}</div>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-sm bg-lux-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-lux-primary/90 disabled:opacity-50">
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editingId ? `Update ${itemLabel}` : `Add ${itemLabel}`}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-sm border border-lux-primary/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            )}
          </div>
        </form>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved {itemLabel}s</h3>
            <p className="mt-1 text-xs text-lux-primary/65">Live data used by the form & public filter sidebar.</p>
          </div>
          <button type="button" onClick={() => void loadCategories()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
        <div className="grid gap-3">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-lux-primary/50">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-10 text-center text-sm text-lux-primary/65">No {itemLabel.toLowerCase()}s defined yet. Add one above to get started.</div>
          ) : (
            categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded-sm border border-lux-primary/10 bg-white p-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lux-primary">{c.name}</h4>
                    {c.displayOrder !== undefined && c.displayOrder !== 0 && (
                      <span className="text-[10px] uppercase tracking-widest text-lux-primary/40">Order: {c.displayOrder}</span>
                    )}
                  </div>
                  <p className="text-xs text-lux-primary/60">{c.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => startEditing(c)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button type="button" onClick={() => void handleDelete(c._id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.section>
    </div>
  );
}

function VehicleCategoryManager() {
  return (
    <GenericCategoryPanel
      endpoint="/api/vehicle-categories"
      title="Manage Vehicle Categories"
      description="Define categories like 4x4 Jeep, Luxury SUV, Sedan, Mini Bus. These will appear in the Add Vehicle form and the Car Rent filter sidebar."
      itemLabel="Vehicle Category"
      placeholder="e.g. 4x4 Jeep"
    />
  );
}

function JeepSafariCategoryManager() {
  return (
    <GenericCategoryPanel
      endpoint="/api/jeep-safari-categories"
      title="Manage Jeep Safari Categories"
      description="Define categories like Adventure, Photography, Cultural, Heritage Safari. These will appear in the Add Jeep Safari form and the public filter sidebar."
      itemLabel="Safari Category"
      placeholder="e.g. Adventure Safari"
    />
  );
}

function TourGuideSpecialtyManager() {
  return (
    <GenericCategoryPanel
      endpoint="/api/tour-guide-specialties"
      title="Manage Tour Guide Specialties"
      description="Define specialties like Trekking, Cultural, Photography, Wildlife. These will appear in the Add Tour Guide form and the public filter sidebar."
      itemLabel="Specialty"
      placeholder="e.g. Trekking Guide"
    />
  );
}

function JeepSafariManager() {
  const [safaris, setSafaris] = useState<JeepSafari[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<JeepSafariFormState>(EMPTY_JEEP_SAFARI_FORM);

  const loadSafaris = async () => {
    setIsLoading(true);
    setError('');
    try {
      const first = await fetch(getApiUrl('/api/jeep-safaris?page=1&limit=50'), { credentials: 'include' });
      const firstData = await parseJsonSafely(first);
      if (!first.ok) {
        setError(firstData?.message || 'Failed to load jeep safaris.');
        setSafaris([]);
        return;
      }
      const totalPages: number = Math.max(Number(firstData?.totalPages) || 1, 1);
      const collected: JeepSafari[] = (Array.isArray(firstData?.data)
        ? firstData.data.map(normalizeJeepSafari).filter(Boolean)
        : []) as JeepSafari[];
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            fetch(getApiUrl(`/api/jeep-safaris?page=${i + 2}&limit=50`), { credentials: 'include' })
              .then((r) => parseJsonSafely(r))
              .then((d) => (Array.isArray(d?.data) ? d.data : []))
              .catch(() => [])
          )
        );
        for (const pageData of rest) {
          for (const raw of pageData) {
            const normalized = normalizeJeepSafari(raw);
            if (normalized) collected.push(normalized);
          }
        }
      }
      setSafaris(collected);
    } catch {
      setError('Unable to fetch jeep safaris.');
      setSafaris([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(getApiUrl('/api/jeep-safari-categories'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (response.ok && Array.isArray(data?.data)) {
        setCategories(data.data.map((c: { _id: string; name: string }) => ({ _id: c._id, name: c.name })));
      }
    } catch {}
  };

  useEffect(() => {
    void loadSafaris();
    void loadCategories();
  }, []);

  const updateField = (field: keyof JeepSafariFormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_JEEP_SAFARI_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setSelectedGalleryFiles([]);
    setIsFormOpen(false);
  };

  const startEditing = (safari: JeepSafari) => {
    setForm(jeepSafariToFormState(safari));
    setEditingId(safari.id);
    setSelectedImage(null);
    setSelectedGalleryFiles([]);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitSafari = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('id', form.id.trim());
      payload.append('name', form.name.trim());
      payload.append('region', form.region.trim());
      payload.append('duration', form.duration.trim());
      payload.append('pricePerPerson', form.pricePerPerson.trim());
      payload.append('pricePerJeep', form.pricePerJeep.trim());
      payload.append('image', form.image.trim());
      payload.append('description', form.description.trim());
      payload.append('category', form.category.trim());
      payload.append('difficulty', form.difficulty.trim());
      payload.append('vehicleType', form.vehicleType.trim());
      payload.append('maxGroupSize', form.maxGroupSize.trim());
      payload.append('bestSeason', form.bestSeason.trim());
      payload.append('startLocation', form.startLocation.trim());
      payload.append('endLocation', form.endLocation.trim());
      payload.append('meetingPoint', form.meetingPoint.trim());
      payload.append('highlights', JSON.stringify(linesToArray(form.highlights)));
      payload.append('includes', JSON.stringify(linesToArray(form.includes)));
      payload.append('excludes', JSON.stringify(linesToArray(form.excludes)));
      payload.append('itinerary', JSON.stringify(parseItineraryFromText(form.itinerary)));
      payload.append('nearbyAttractions', JSON.stringify(linesToArray(form.nearbyAttractions)));
      if (form.latitude.trim()) payload.append('latitude', form.latitude.trim());
      if (form.longitude.trim()) payload.append('longitude', form.longitude.trim());
      payload.append('featured', String(form.featured));
      payload.append('displayOrder', form.displayOrder.trim() || '0');
      if (selectedImage) payload.set('image', selectedImage);
      selectedGalleryFiles.forEach((file) => payload.append('galleryFiles', file));

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/jeep-safaris/${editingId}` : '/api/jeep-safaris'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload }
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save jeep safari.');
        return;
      }
      setSuccessMessage(isEditing ? 'Jeep safari updated successfully.' : 'Jeep safari created successfully.');
      resetForm();
      await loadSafaris();
    } catch {
      setError('Unable to save jeep safari right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeSafari = async (safariId: string) => {
    if (!window.confirm(`Delete jeep safari "${safariId}"?`)) return;
    try {
      const response = await fetch(getApiUrl(`/api/jeep-safaris/${safariId}`), { method: 'DELETE', credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to delete jeep safari.');
        return;
      }
      setSuccessMessage('Jeep safari deleted successfully.');
      if (editingId === safariId) resetForm();
      await loadSafaris();
    } catch {
      setError('Unable to delete jeep safari right now.');
    }
  };

  const inputClass = "w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent";
  const labelSpan = "mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Jeep Safari API</p>
              <h3 className="mt-2 font-headings text-2xl">Jeep Safari Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">Manage the jeep safari trips shown on the Jeep Safari service page.</p>
            </div>
            <button type="button" onClick={() => { setForm(EMPTY_JEEP_SAFARI_FORM); setEditingId(null); setSelectedImage(null); setSelectedGalleryFiles([]); setError(''); setSuccessMessage(''); setIsFormOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
              <Plus className="h-4 w-4" /> New Jeep Safari
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitSafari}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Jeep Safari' : 'Create Jeep Safari'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">All data here is served by the backend REST API.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block"><span className={labelSpan}>Safari ID (slug)</span><input value={form.id} onChange={(e) => updateField('id', e.target.value)} disabled={Boolean(editingId)} className={inputClass} placeholder="deosai-day-safari" required /></label>
            <label className="block"><span className={labelSpan}>Name</span><input value={form.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} placeholder="Deosai Plains Day Safari" required /></label>
            <label className="block"><span className={labelSpan}>Region</span><input value={form.region} onChange={(e) => updateField('region', e.target.value)} className={inputClass} placeholder="Skardu / Deosai" /></label>
            <label className="block"><span className={labelSpan}>Duration</span><input value={form.duration} onChange={(e) => updateField('duration', e.target.value)} className={inputClass} placeholder="Full Day / 2 Days" /></label>
            <label className="block"><span className={labelSpan}>Price Per Person</span><input value={form.pricePerPerson} onChange={(e) => updateField('pricePerPerson', e.target.value)} className={inputClass} placeholder="PKR 12,000" /></label>
            <label className="block"><span className={labelSpan}>Price Per Jeep</span><input value={form.pricePerJeep} onChange={(e) => updateField('pricePerJeep', e.target.value)} className={inputClass} placeholder="PKR 45,000" /></label>
            <label className="block">
              <span className={labelSpan}>Category</span>
              {categories.length > 0 ? (
                <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass}>
                  <option value="">Select category</option>
                  {categories.map((c) => (<option key={c._id} value={c.name}>{c.name}</option>))}
                </select>
              ) : (
                <input value={form.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass} placeholder="Adventure / Photography" />
              )}
            </label>
            <label className="block"><span className={labelSpan}>Difficulty</span><input value={form.difficulty} onChange={(e) => updateField('difficulty', e.target.value)} className={inputClass} placeholder="Easy / Moderate / Challenging" /></label>
            <label className="block"><span className={labelSpan}>Vehicle Type</span><input value={form.vehicleType} onChange={(e) => updateField('vehicleType', e.target.value)} className={inputClass} placeholder="Toyota Land Cruiser" /></label>
            <label className="block"><span className={labelSpan}>Max Group Size</span><input value={form.maxGroupSize} onChange={(e) => updateField('maxGroupSize', e.target.value)} className={inputClass} placeholder="5-6 people" /></label>
            <label className="block"><span className={labelSpan}>Best Season</span><input value={form.bestSeason} onChange={(e) => updateField('bestSeason', e.target.value)} className={inputClass} placeholder="May - September" /></label>
            <label className="block"><span className={labelSpan}>Start Location</span><input value={form.startLocation} onChange={(e) => updateField('startLocation', e.target.value)} className={inputClass} placeholder="Skardu" /></label>
            <label className="block"><span className={labelSpan}>End Location</span><input value={form.endLocation} onChange={(e) => updateField('endLocation', e.target.value)} className={inputClass} placeholder="Skardu" /></label>
            <label className="block lg:col-span-2"><span className={labelSpan}>Meeting Point</span><input value={form.meetingPoint} onChange={(e) => updateField('meetingPoint', e.target.value)} className={inputClass} placeholder="Hotel pickup / Skardu Bazaar" /></label>
            <label className="block"><span className={labelSpan}>Image URL</span><input value={form.image} onChange={(e) => updateField('image', e.target.value)} className={inputClass} placeholder="https://..." /></label>
            <label className="block"><span className={labelSpan}>Upload Main Image</span><input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" /></label>
            <label className="block lg:col-span-2"><span className={labelSpan}>Upload Gallery (multiple)</span><input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedGalleryFiles(Array.from(e.target.files || []))} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" /></label>
            <label className="block lg:col-span-2"><span className={labelSpan}>Description</span><textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Describe this safari trip..." /></label>
            <label className="block"><span className={labelSpan}>Highlights (one per line)</span><textarea value={form.highlights} onChange={(e) => updateField('highlights', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Sheosar Lake&#10;Bara Pani crossing" /></label>
            <label className="block"><span className={labelSpan}>Nearby Attractions (one per line)</span><textarea value={form.nearbyAttractions} onChange={(e) => updateField('nearbyAttractions', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Shangrila Resort&#10;Upper Kachura" /></label>
            <label className="block"><span className={labelSpan}>Includes (one per line)</span><textarea value={form.includes} onChange={(e) => updateField('includes', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Jeep with driver&#10;Fuel&#10;Park entry fee" /></label>
            <label className="block"><span className={labelSpan}>Excludes (one per line)</span><textarea value={form.excludes} onChange={(e) => updateField('excludes', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Meals&#10;Personal expenses" /></label>
            <label className="block lg:col-span-2"><span className={labelSpan}>Itinerary (one step per line in the form: Day | Title | Description)</span><textarea value={form.itinerary} onChange={(e) => updateField('itinerary', e.target.value)} className="min-h-32 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Day 1 | Skardu to Deosai | Drive through scenic landscapes...&#10;Day 1 | Sheosar Lake | Visit the iconic alpine lake..." /></label>
            <label className="block"><span className={labelSpan}>Latitude</span><input value={form.latitude} onChange={(e) => updateField('latitude', e.target.value)} className={inputClass} placeholder="35.3" /></label>
            <label className="block"><span className={labelSpan}>Longitude</span><input value={form.longitude} onChange={(e) => updateField('longitude', e.target.value)} className={inputClass} placeholder="75.6" /></label>
            <label className="block"><span className={labelSpan}>Display Order</span><input type="number" value={form.displayOrder} onChange={(e) => updateField('displayOrder', e.target.value)} className={inputClass} placeholder="0" /></label>
            <label className="flex items-center gap-3 lg:col-span-2"><input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} className="h-4 w-4" /><span className="text-sm text-lux-primary/70">Featured on landing page</span></label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{error}</span></div> : null}
                {successMessage ? <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Jeep Safari' : 'Create Jeep Safari'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">Click <span className="font-bold text-lux-primary">New Jeep Safari</span> to open the form.</div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Jeep Safaris</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live data for the /services/jeep-safari listing page.</p>
          </div>
          <button type="button" onClick={() => void loadSafaris()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading jeep safaris...
          </div>
        ) : safaris.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No jeep safaris created yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {safaris.map((safari) => (
              <article key={safari.id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                {safari.image ? <img src={safari.image} alt={safari.name} className="h-48 w-full object-cover" /> : null}
                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-lux-accent">{safari.category || 'Safari'}{safari.featured ? ' · Featured' : ''}</div>
                    <h4 className="mt-2 font-headings text-xl">{safari.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-lux-primary/70">
                    <div><span className="font-bold text-lux-primary">Region:</span> {safari.region || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Duration:</span> {safari.duration || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Per Person:</span> {safari.pricePerPerson || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Per Jeep:</span> {safari.pricePerJeep || '—'}</div>
                  </div>
                  <p className="text-sm text-lux-primary/70 line-clamp-3">{safari.description || 'No description added.'}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEditing(safari)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => void removeSafari(safari.id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function TourGuideManager() {
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [specialties, setSpecialties] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<TourGuideFormState>(EMPTY_TOUR_GUIDE_FORM);

  const loadGuides = async () => {
    setIsLoading(true);
    setError('');
    try {
      const first = await fetch(getApiUrl('/api/tour-guides?page=1&limit=50'), { credentials: 'include' });
      const firstData = await parseJsonSafely(first);
      if (!first.ok) {
        setError(firstData?.message || 'Failed to load tour guides.');
        setGuides([]);
        return;
      }
      const totalPages: number = Math.max(Number(firstData?.totalPages) || 1, 1);
      const collected: TourGuide[] = (Array.isArray(firstData?.data)
        ? firstData.data.map(normalizeTourGuide).filter(Boolean)
        : []) as TourGuide[];
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            fetch(getApiUrl(`/api/tour-guides?page=${i + 2}&limit=50`), { credentials: 'include' })
              .then((r) => parseJsonSafely(r))
              .then((d) => (Array.isArray(d?.data) ? d.data : []))
              .catch(() => [])
          )
        );
        for (const pageData of rest) {
          for (const raw of pageData) {
            const normalized = normalizeTourGuide(raw);
            if (normalized) collected.push(normalized);
          }
        }
      }
      setGuides(collected);
    } catch {
      setError('Unable to fetch tour guides.');
      setGuides([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      const response = await fetch(getApiUrl('/api/tour-guide-specialties'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (response.ok && Array.isArray(data?.data)) {
        setSpecialties(data.data.map((s: { _id: string; name: string }) => ({ _id: s._id, name: s.name })));
      }
    } catch {}
  };

  useEffect(() => {
    void loadGuides();
    void loadSpecialties();
  }, []);

  const updateField = (field: keyof TourGuideFormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_TOUR_GUIDE_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setSelectedGalleryFiles([]);
    setIsFormOpen(false);
  };

  const startEditing = (guide: TourGuide) => {
    setForm(tourGuideToFormState(guide));
    setEditingId(guide.id);
    setSelectedImage(null);
    setSelectedGalleryFiles([]);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitGuide = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('id', form.id.trim());
      payload.append('name', form.name.trim());
      payload.append('image', form.image.trim());
      payload.append('shortBio', form.shortBio.trim());
      payload.append('bio', form.bio.trim());
      payload.append('experience', form.experience.trim());
      payload.append('pricePerDay', form.pricePerDay.trim());
      payload.append('languages', JSON.stringify(linesToArray(form.languages)));
      payload.append('specialties', JSON.stringify(linesToArray(form.specialties)));
      payload.append('category', form.category.trim());
      payload.append('region', form.region.trim());
      payload.append('baseCity', form.baseCity.trim());
      payload.append('certifications', JSON.stringify(linesToArray(form.certifications)));
      if (form.rating.trim()) payload.append('rating', form.rating.trim());
      if (form.totalTrips.trim()) payload.append('totalTrips', form.totalTrips.trim());
      payload.append('phoneNumber', form.phoneNumber.trim());
      payload.append('email', form.email.trim());
      payload.append('whatsapp', form.whatsapp.trim());
      payload.append('available', String(form.available));
      payload.append('featured', String(form.featured));
      payload.append('displayOrder', form.displayOrder.trim() || '0');
      if (selectedImage) payload.set('image', selectedImage);
      selectedGalleryFiles.forEach((file) => payload.append('galleryFiles', file));

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/tour-guides/${editingId}` : '/api/tour-guides'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload }
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save tour guide.');
        return;
      }
      setSuccessMessage(isEditing ? 'Tour guide updated successfully.' : 'Tour guide created successfully.');
      resetForm();
      await loadGuides();
    } catch {
      setError('Unable to save tour guide right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeGuide = async (guideId: string) => {
    if (!window.confirm(`Delete tour guide "${guideId}"?`)) return;
    try {
      const response = await fetch(getApiUrl(`/api/tour-guides/${guideId}`), { method: 'DELETE', credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to delete tour guide.');
        return;
      }
      setSuccessMessage('Tour guide deleted successfully.');
      if (editingId === guideId) resetForm();
      await loadGuides();
    } catch {
      setError('Unable to delete tour guide right now.');
    }
  };

  const inputClass = "w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent";
  const labelSpan = "mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Tour Guide API</p>
              <h3 className="mt-2 font-headings text-2xl">Tour Guide Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">Manage the tour guides shown on the Tour Guide service page.</p>
            </div>
            <button type="button" onClick={() => { setForm(EMPTY_TOUR_GUIDE_FORM); setEditingId(null); setSelectedImage(null); setSelectedGalleryFiles([]); setError(''); setSuccessMessage(''); setIsFormOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
              <Plus className="h-4 w-4" /> New Tour Guide
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitGuide}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Tour Guide' : 'Create Tour Guide'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">All data here is served by the backend REST API.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block"><span className={labelSpan}>Guide ID (slug)</span><input value={form.id} onChange={(e) => updateField('id', e.target.value)} disabled={Boolean(editingId)} className={inputClass} placeholder="ali-shahzad" required /></label>
            <label className="block"><span className={labelSpan}>Name</span><input value={form.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} placeholder="Ali Shahzad" required /></label>
            <label className="block">
              <span className={labelSpan}>Primary Category</span>
              {specialties.length > 0 ? (
                <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass}>
                  <option value="">Select specialty</option>
                  {specialties.map((s) => (<option key={s._id} value={s.name}>{s.name}</option>))}
                </select>
              ) : (
                <input value={form.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass} placeholder="Trekking / Cultural" />
              )}
            </label>
            <label className="block"><span className={labelSpan}>Experience</span><input value={form.experience} onChange={(e) => updateField('experience', e.target.value)} className={inputClass} placeholder="8 years" /></label>
            <label className="block"><span className={labelSpan}>Region</span><input value={form.region} onChange={(e) => updateField('region', e.target.value)} className={inputClass} placeholder="Hunza Valley" /></label>
            <label className="block"><span className={labelSpan}>Base City</span><input value={form.baseCity} onChange={(e) => updateField('baseCity', e.target.value)} className={inputClass} placeholder="Gilgit" /></label>
            <label className="block"><span className={labelSpan}>Price Per Day</span><input value={form.pricePerDay} onChange={(e) => updateField('pricePerDay', e.target.value)} className={inputClass} placeholder="PKR 8,000 / day" /></label>
            <label className="block"><span className={labelSpan}>Rating (0-5)</span><input value={form.rating} onChange={(e) => updateField('rating', e.target.value)} type="number" step="0.1" min="0" max="5" className={inputClass} placeholder="4.8" /></label>
            <label className="block"><span className={labelSpan}>Total Trips Completed</span><input value={form.totalTrips} onChange={(e) => updateField('totalTrips', e.target.value)} type="number" className={inputClass} placeholder="120" /></label>
            <label className="block"><span className={labelSpan}>Phone Number</span><input value={form.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} className={inputClass} placeholder="+92 300 1234567" /></label>
            <label className="block"><span className={labelSpan}>Email</span><input value={form.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass} placeholder="ali@example.com" /></label>
            <label className="block"><span className={labelSpan}>WhatsApp Number</span><input value={form.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} className={inputClass} placeholder="+92 300 1234567" /></label>
            <label className="block"><span className={labelSpan}>Image URL</span><input value={form.image} onChange={(e) => updateField('image', e.target.value)} className={inputClass} placeholder="https://..." /></label>
            <label className="block"><span className={labelSpan}>Upload Portrait Image</span><input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" /></label>
            <label className="block lg:col-span-2"><span className={labelSpan}>Upload Gallery (multiple)</span><input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedGalleryFiles(Array.from(e.target.files || []))} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" /></label>
            <label className="block lg:col-span-2"><span className={labelSpan}>Short Bio (for card)</span><textarea value={form.shortBio} onChange={(e) => updateField('shortBio', e.target.value)} className="min-h-16 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="One-line headline shown on listing cards." /></label>
            <label className="block lg:col-span-2"><span className={labelSpan}>Full Bio (for detail page)</span><textarea value={form.bio} onChange={(e) => updateField('bio', e.target.value)} className="min-h-32 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Tell the guide's story, qualifications, and trekking experience." /></label>
            <label className="block"><span className={labelSpan}>Languages (one per line)</span><textarea value={form.languages} onChange={(e) => updateField('languages', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="English&#10;Urdu&#10;Burushaski" /></label>
            <label className="block"><span className={labelSpan}>Specialties (one per line)</span><textarea value={form.specialties} onChange={(e) => updateField('specialties', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Trekking&#10;Photography&#10;Cultural Tours" /></label>
            <label className="block lg:col-span-2"><span className={labelSpan}>Certifications (one per line)</span><textarea value={form.certifications} onChange={(e) => updateField('certifications', e.target.value)} className="min-h-20 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Wilderness First Aid&#10;PTDC Licensed Guide" /></label>
            <label className="block"><span className={labelSpan}>Display Order</span><input type="number" value={form.displayOrder} onChange={(e) => updateField('displayOrder', e.target.value)} className={inputClass} placeholder="0" /></label>
            <label className="flex items-center gap-3"><input type="checkbox" checked={form.available} onChange={(e) => updateField('available', e.target.checked)} className="h-4 w-4" /><span className="text-sm text-lux-primary/70">Currently available for bookings</span></label>
            <label className="flex items-center gap-3 lg:col-span-2"><input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} className="h-4 w-4" /><span className="text-sm text-lux-primary/70">Featured on landing page</span></label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{error}</span></div> : null}
                {successMessage ? <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Tour Guide' : 'Create Tour Guide'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">Click <span className="font-bold text-lux-primary">New Tour Guide</span> to open the form.</div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Tour Guides</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live data for the /services/tour-guide listing page.</p>
          </div>
          <button type="button" onClick={() => void loadGuides()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading tour guides...
          </div>
        ) : guides.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No tour guides created yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {guides.map((guide) => (
              <article key={guide.id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                {guide.image ? <img src={guide.image} alt={guide.name} className="h-56 w-full object-cover" /> : null}
                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-lux-accent">{guide.category || 'Guide'}{guide.featured ? ' · Featured' : ''}</div>
                    <h4 className="mt-2 font-headings text-xl">{guide.name}</h4>
                    <p className="mt-1 text-xs text-lux-primary/60">{guide.region || ''}{guide.baseCity ? ` · ${guide.baseCity}` : ''}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-lux-primary/70">
                    <div><span className="font-bold text-lux-primary">Experience:</span> {guide.experience || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Per Day:</span> {guide.pricePerDay || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Rating:</span> {guide.rating ? guide.rating.toFixed(1) : '—'}</div>
                    <div><span className="font-bold text-lux-primary">Trips:</span> {guide.totalTrips || '—'}</div>
                  </div>
                  <p className="text-sm text-lux-primary/70 line-clamp-3">{guide.shortBio || guide.bio || 'No bio added.'}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEditing(guide)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => void removeGuide(guide.id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function HotelCategoryManager() {
  const [categories, setCategories] = useState<{ _id: string; name: string; description?: string; displayOrder?: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/hotel-categories'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (response.ok && Array.isArray(data?.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch {
      setError('Failed to fetch hotel categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadCategories(); }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDisplayOrder('0');
    setEditingId(null);
  };

  const startEditing = (category: { _id: string; name: string; description?: string; displayOrder?: number }) => {
    setName(category.name);
    setDescription(category.description || '');
    setDisplayOrder(String(category.displayOrder ?? 0));
    setEditingId(category._id);
    setError('');
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/hotel-categories/${editingId}` : '/api/hotel-categories'),
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            displayOrder: Number(displayOrder) || 0,
          }),
        },
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save hotel category');
        return;
      }
      setSuccessMessage(isEditing ? 'Hotel category updated successfully' : 'Hotel category added successfully');
      resetForm();
      await loadCategories();
    } catch {
      setError('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hotel category?')) return;
    try {
      const response = await fetch(getApiUrl(`/api/hotel-categories/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setSuccessMessage('Deleted successfully');
        if (editingId === id) resetForm();
        await loadCategories();
      } else {
        const data = await parseJsonSafely(response);
        setError(data?.message || 'Failed to delete');
      }
    } catch {
      setError('Failed to delete');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Hotel Categories API</p>
          <h3 className="mt-2 font-headings text-2xl">Manage Hotel Categories</h3>
          <p className="mt-2 text-sm text-lux-primary/65">Define categories like <em>5-Star Luxury, Boutique Resort, Mountain Lodge</em>. These will appear in the Add Hotel form and on the public filter sidebar.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Category Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="e.g. 5-Star Luxury" required />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Display Order</span>
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="0" />
            </label>
            <label className="block sm:col-span-3">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description (Optional)</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Short description" />
            </label>
          </div>
          {error && <div className="flex items-start gap-2 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"><AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /><span>{error}</span></div>}
          {successMessage && <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{successMessage}</div>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-sm bg-lux-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-lux-primary/90 disabled:opacity-50">
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Update Category' : 'Add Category'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-sm border border-lux-primary/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            )}
          </div>
        </form>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Categories</h3>
            <p className="mt-1 text-xs text-lux-primary/65">Live data used by the Add Hotel form and public filter sidebar.</p>
          </div>
          <button type="button" onClick={() => void loadCategories()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
        <div className="grid gap-3">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-lux-primary/50">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-10 text-center text-sm text-lux-primary/65">No hotel categories defined yet. Add one above to get started.</div>
          ) : (
            categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded-sm border border-lux-primary/10 bg-white p-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lux-primary">{c.name}</h4>
                    {c.displayOrder !== undefined && c.displayOrder !== 0 && (
                      <span className="text-[10px] uppercase tracking-widest text-lux-primary/40">Order: {c.displayOrder}</span>
                    )}
                  </div>
                  <p className="text-xs text-lux-primary/60">{c.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => startEditing(c)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button type="button" onClick={() => void handleDelete(c._id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.section>
    </div>
  );
}

function HotelManager() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelCategories, setHotelCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [selectedRoomFiles, setSelectedRoomFiles] = useState<Record<number, File>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<HotelFormState>(EMPTY_HOTEL_FORM);

  const loadHotels = async () => {
    setIsLoading(true);
    setError('');
    try {
      const first = await fetch(getApiUrl('/api/hotels?page=1&limit=50'), { credentials: 'include' });
      const firstData = await parseJsonSafely(first);
      if (!first.ok) {
        setError(firstData?.message || 'Failed to load hotels.');
        setHotels([]);
        return;
      }
      const totalPages: number = Math.max(Number(firstData?.totalPages) || 1, 1);
      const collected: Hotel[] = (Array.isArray(firstData?.data)
        ? firstData.data.map(normalizeHotel).filter(Boolean)
        : []) as Hotel[];

      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            fetch(getApiUrl(`/api/hotels?page=${i + 2}&limit=50`), { credentials: 'include' }).then(parseJsonSafely),
          ),
        );
        rest.forEach((data) => {
          if (Array.isArray(data?.data)) {
            (data.data.map(normalizeHotel).filter(Boolean) as Hotel[]).forEach((h) => collected.push(h));
          }
        });
      }

      setHotels(collected);
    } catch {
      setError('Unable to fetch hotels from the backend.');
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHotelCategories = async () => {
    try {
      const response = await fetch(getApiUrl('/api/hotel-categories'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (response.ok && Array.isArray(data?.data)) {
        setHotelCategories(data.data);
      }
    } catch {
      /* silent — form falls back gracefully */
    }
  };

  useEffect(() => {
    void loadHotels();
    void loadHotelCategories();
  }, []);

  const updateField = (field: keyof HotelFormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const updateRoom = (index: number, field: keyof HotelRoomFormState, value: string) =>
    setForm((current) => ({
      ...current,
      rooms: current.rooms.map((room, idx) => (idx === index ? { ...room, [field]: value } : room)),
    }));

  const addRoom = () =>
    setForm((current) => ({ ...current, rooms: [...current.rooms, { ...EMPTY_HOTEL_ROOM_FORM }] }));

  const removeRoom = (index: number) => {
    setForm((current) => ({
      ...current,
      rooms: current.rooms.filter((_, idx) => idx !== index),
    }));
    setSelectedRoomFiles((current) => {
      const next: Record<number, File> = {};
      Object.entries(current).forEach(([key, value]) => {
        const oldIdx = Number(key);
        if (oldIdx < index) next[oldIdx] = value;
        else if (oldIdx > index) next[oldIdx - 1] = value;
      });
      return next;
    });
  };

  const resetForm = () => {
    setForm(EMPTY_HOTEL_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setSelectedGalleryFiles([]);
    setSelectedRoomFiles({});
    setIsFormOpen(false);
  };

  const startEditing = (hotel: Hotel) => {
    setForm(hotelToFormState(hotel));
    setEditingId(hotel.id);
    setSelectedImage(null);
    setSelectedGalleryFiles([]);
    setSelectedRoomFiles({});
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitHotel = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('id', form.id.trim());
      payload.append('name', form.name.trim());
      payload.append('location', form.location.trim());
      payload.append('address', form.address.trim());
      payload.append('category', form.category.trim());
      payload.append('rating', form.rating.trim() || '0');
      payload.append('description', form.description.trim());
      payload.append('image', form.image.trim());
      payload.append('priceFrom', form.priceFrom.trim());
      payload.append('amenities', JSON.stringify(linesToArray(form.amenities)));
      payload.append('policies', form.policies.trim());
      payload.append('checkIn', form.checkIn.trim());
      payload.append('checkOut', form.checkOut.trim());
      payload.append('nearbyAttractions', JSON.stringify(linesToArray(form.nearbyAttractions)));
      payload.append('phoneNumber', form.phoneNumber.trim());
      payload.append('email', form.email.trim());
      payload.append('website', form.website.trim());
      payload.append('latitude', form.latitude.trim());
      payload.append('longitude', form.longitude.trim());
      payload.append('featured', String(form.featured));
      payload.append('displayOrder', form.displayOrder.trim() || '0');

      const roomsPayload = form.rooms.map((room) => ({
        name: room.name.trim(),
        description: room.description.trim(),
        price: room.price.trim(),
        image: room.image.trim(),
        capacity: room.capacity.trim(),
        beds: room.beds.trim(),
        size: room.size.trim(),
        amenities: linesToArray(room.amenities),
      }));
      payload.append('rooms', JSON.stringify(roomsPayload));

      if (selectedImage) payload.set('image', selectedImage);
      selectedGalleryFiles.forEach((file) => payload.append('galleryFiles', file));
      Object.entries(selectedRoomFiles).forEach(([roomIdx, file]) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const renamed = new File([file], `room-${roomIdx}-${safeName}`, { type: file.type });
        payload.append('roomImages', renamed);
      });

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/hotels/${editingId}` : '/api/hotels'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload },
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save hotel.');
        return;
      }
      setSuccessMessage(isEditing ? 'Hotel updated successfully.' : 'Hotel created successfully.');
      resetForm();
      await loadHotels();
    } catch {
      setError('Unable to save hotel right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeHotel = async (hotelId: string) => {
    if (!window.confirm(`Delete hotel "${hotelId}"?`)) return;
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(getApiUrl(`/api/hotels/${hotelId}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to delete hotel.');
        return;
      }
      setSuccessMessage('Hotel deleted successfully.');
      if (editingId === hotelId) resetForm();
      await loadHotels();
    } catch {
      setError('Unable to delete hotel right now.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Hotels API</p>
              <h3 className="mt-2 font-headings text-2xl">Hotel Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">Manage hotels, rooms, pricing, and amenities displayed on the Accommodation service page.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_HOTEL_FORM);
                setEditingId(null);
                setSelectedImage(null);
                setSelectedGalleryFiles([]);
                setSelectedRoomFiles({});
                setError('');
                setSuccessMessage('');
                setIsFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
            >
              <Plus className="h-4 w-4" />
              New Hotel
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitHotel}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Hotel' : 'Create Hotel'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">Provide all hotel details — including rooms, prices and amenities.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Hotel ID (slug)</span><input value={form.id} onChange={(e) => updateField('id', e.target.value)} disabled={Boolean(editingId)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="hunza-serena-inn" required /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Hotel Name</span><input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Serena Inn Hunza" required /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Location</span><input value={form.location} onChange={(e) => updateField('location', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Hunza Valley, Gilgit-Baltistan" required /></label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Category</span>
              {hotelCategories.length > 0 ? (
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent appearance-none"
                >
                  <option value="">Select a category...</option>
                  {hotelCategories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                  {form.category && !hotelCategories.some((c) => c.name === form.category) ? (
                    <option value={form.category}>{form.category} (legacy)</option>
                  ) : null}
                </select>
              ) : (
                <>
                  <input
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                    placeholder="5-Star Luxury / Boutique Resort"
                  />
                  <p className="mt-1 text-[10px] text-lux-primary/50">Add categories from the <strong>Hotel Categories</strong> tab to get a dropdown here.</p>
                </>
              )}
            </label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Rating (0-5)</span><input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => updateField('rating', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="4.7" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Starting Price</span><input value={form.priceFrom} onChange={(e) => updateField('priceFrom', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="From PKR 12,500 / night" /></label>
            <label className="block lg:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Address</span><input value={form.address} onChange={(e) => updateField('address', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Main Karakoram Highway, Karimabad, Hunza" /></label>

            <label className="block lg:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description</span><textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="min-h-28 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Describe this hotel and its guest experience..." /></label>

            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Main Image URL</span><input value={form.image} onChange={(e) => updateField('image', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Main Image</span><input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" /></label>

            <label className="block lg:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Gallery Images (replaces existing)</span><input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedGalleryFiles(Array.from(e.target.files || []))} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" />{selectedGalleryFiles.length > 0 ? <p className="mt-1 text-xs text-lux-primary/65">{selectedGalleryFiles.length} new gallery image(s) ready to upload.</p> : null}</label>

            <label className="block lg:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Amenities (one per line)</span><textarea value={form.amenities} onChange={(e) => updateField('amenities', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder={'Free Wi-Fi\nMountain View\nRestaurant\nSpa & Wellness'} /></label>

            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Check-in Time</span><input value={form.checkIn} onChange={(e) => updateField('checkIn', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="From 2:00 PM" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Check-out Time</span><input value={form.checkOut} onChange={(e) => updateField('checkOut', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Until 12:00 PM" /></label>

            <label className="block lg:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Hotel Policies</span><textarea value={form.policies} onChange={(e) => updateField('policies', e.target.value)} className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Cancellation policy, child policy, pet policy, etc." /></label>

            <label className="block lg:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Nearby Attractions (one per line)</span><textarea value={form.nearbyAttractions} onChange={(e) => updateField('nearbyAttractions', e.target.value)} className="min-h-20 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder={'Baltit Fort - 2 km\nAttabad Lake - 25 km'} /></label>

            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Phone Number</span><input value={form.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="+92 ..." /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Email</span><input value={form.email} onChange={(e) => updateField('email', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="reservations@hotel.com" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Website</span><input value={form.website} onChange={(e) => updateField('website', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Display Order</span><input type="number" value={form.displayOrder} onChange={(e) => updateField('displayOrder', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="0" /></label>

            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Latitude</span><input value={form.latitude} onChange={(e) => updateField('latitude', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="36.3167" /></label>
            <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Longitude</span><input value={form.longitude} onChange={(e) => updateField('longitude', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="74.6500" /></label>

            <label className="flex items-center gap-3 lg:col-span-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} className="h-4 w-4" />
              <span className="text-sm text-lux-primary/70">Mark as featured hotel</span>
            </label>

            {/* Rooms Editor */}
            <div className="lg:col-span-2 border-t border-lux-primary/10 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="font-headings text-xl">Room Types</h5>
                  <p className="text-xs text-lux-primary/65 mt-1">Add each room category with its own pricing and amenities.</p>
                </div>
                <button type="button" onClick={addRoom} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                  <Plus className="h-3.5 w-3.5" /> Add Room
                </button>
              </div>

              {form.rooms.length === 0 ? (
                <div className="rounded-sm border border-dashed border-lux-primary/20 px-6 py-10 text-center text-xs text-lux-primary/60">No rooms added yet. Click "Add Room" to start.</div>
              ) : (
                <div className="space-y-5">
                  {form.rooms.map((room, idx) => (
                    <div key={idx} className="rounded-sm border border-lux-primary/15 bg-lux-bg/40 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="text-[10px] font-bold uppercase tracking-[0.22em] text-lux-accent">Room {idx + 1}</h6>
                        <button type="button" onClick={() => removeRoom(idx)} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 hover:underline">
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Room Name</span><input value={room.name} onChange={(e) => updateRoom(idx, 'name', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-3 py-2 text-sm" placeholder="Deluxe Mountain View" required /></label>
                        <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Price</span><input value={room.price} onChange={(e) => updateRoom(idx, 'price', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-3 py-2 text-sm" placeholder="PKR 15,000" /></label>
                        <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Capacity</span><input value={room.capacity} onChange={(e) => updateRoom(idx, 'capacity', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-3 py-2 text-sm" placeholder="2 Adults" /></label>
                        <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Beds</span><input value={room.beds} onChange={(e) => updateRoom(idx, 'beds', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-3 py-2 text-sm" placeholder="1 King Bed" /></label>
                        <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Size</span><input value={room.size} onChange={(e) => updateRoom(idx, 'size', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-3 py-2 text-sm" placeholder="32 m²" /></label>
                        <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Image URL</span><input value={room.image} onChange={(e) => updateRoom(idx, 'image', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-3 py-2 text-sm" placeholder="https://..." /></label>
                        <label className="block sm:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Upload Room Image (optional)</span><input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => {
                          const file = e.target.files?.[0];
                          setSelectedRoomFiles((current) => {
                            const next = { ...current };
                            if (file) next[idx] = file;
                            else delete next[idx];
                            return next;
                          });
                        }} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-white px-3 py-2 text-sm" /></label>
                        <label className="block sm:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Description</span><textarea value={room.description} onChange={(e) => updateRoom(idx, 'description', e.target.value)} className="min-h-16 w-full rounded-sm border border-lux-primary/15 bg-white px-3 py-2 text-sm" placeholder="Spacious room with private balcony..." /></label>
                        <label className="block sm:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary/60">Room Amenities (one per line)</span><textarea value={room.amenities} onChange={(e) => updateRoom(idx, 'amenities', e.target.value)} className="min-h-16 w-full rounded-sm border border-lux-primary/15 bg-white px-3 py-2 text-sm" placeholder={'Air Conditioning\nFlat-screen TV\nMinibar'} /></label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{error}</span></div> : null}
                {successMessage ? <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Hotel' : 'Create Hotel'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">Click <span className="font-bold text-lux-primary">New Hotel</span> to open the form.</div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Hotels</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live data for the Accommodation service page.</p>
          </div>
          <button type="button" onClick={() => void loadHotels()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading hotels...
          </div>
        ) : hotels.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No hotels found yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <article key={hotel.id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                {hotel.image ? <img src={hotel.image} alt={hotel.name} className="h-48 w-full object-cover" /> : null}
                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-lux-accent">{hotel.category || 'Hotel'}</div>
                    <h4 className="mt-2 font-headings text-xl">{hotel.name}</h4>
                    <p className="mt-1 text-xs text-lux-primary/65">{hotel.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-lux-primary/70">
                    <div><span className="font-bold text-lux-primary">Price:</span> {hotel.priceFrom || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Rating:</span> {hotel.rating ? hotel.rating.toFixed(1) : '—'}</div>
                    <div><span className="font-bold text-lux-primary">Rooms:</span> {hotel.rooms?.length || 0}</div>
                    <div><span className="font-bold text-lux-primary">Featured:</span> {hotel.featured ? 'Yes' : 'No'}</div>
                  </div>
                  <p className="text-sm text-lux-primary/70 line-clamp-3">{hotel.description || 'No description added.'}</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEditing(hotel)} className="inline-flex items-center gap-1 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => void removeHotel(hotel.id)} className="inline-flex items-center gap-1 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function FeaturedManager() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadTours = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Load all tours to choose from
      const response = await fetch(getApiUrl('/api/tour-packages?page=1'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to load tour packages.'); setTours([]); return; }

      const totalPages = data.totalPages || 1;
      let allTours = Array.isArray(data?.data) ? data.data : [];

      if (totalPages > 1) {
        for (let i = 2; i <= totalPages; i++) {
          const res = await fetch(getApiUrl(`/api/tour-packages?page=${i}`), { credentials: 'include' });
          const d = await parseJsonSafely(res);
          if (res.ok && Array.isArray(d?.data)) allTours = [...allTours, ...d.data];
        }
      }

      setTours(allTours.map(normalizeTourPackage).filter(Boolean) as TourPackage[]);
    } catch {
      setError('Unable to fetch tour packages.');
      setTours([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadTours(); }, []);

  const toggleFeatured = async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/tour-packages/${id}/featured`), {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to update featured status.');
        return;
      }
      setSuccessMessage(data.message);
      // Update local state
      setTours(tours.map(t => t.id === id ? { ...t, featured: !t.featured } : t));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setError('Network error updating status.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-6">
          <h3 className="font-headings text-2xl">Landing Page Display</h3>
          <p className="mt-2 text-sm text-lux-primary/65">
            Select which tour packages should be displayed in the "Popular Tours" section on your homepage.
            Click the star icon to toggle.
          </p>
        </div>

        {error ? (
          <div className="m-6 flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="m-6 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-lux-primary/60">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading tours...
            </div>
          ) : tours.length === 0 ? (
            <div className="py-10 text-center text-sm text-lux-primary/50">No tour packages found. Add some in the Tour Packages section first.</div>
          ) : (
            <div className="space-y-3">
              {tours.map((tour) => (
                <div key={tour.id} className="flex items-center justify-between rounded-sm border border-lux-primary/10 bg-lux-bg/30 p-4 transition hover:border-lux-accent/30 hover:bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-sm bg-lux-bg">
                      {tour.image ? <img src={tour.image} alt="" className="h-full w-full object-cover" /> : null}
                    </div>
                    <div>
                      <h4 className="font-bold text-lux-primary">{tour.title}</h4>
                      <p className="text-xs text-lux-primary/60">{tour.id} • {tour.type || 'No type'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => void toggleFeatured(tour.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${tour.featured ? 'bg-lux-accent text-white shadow-md' : 'bg-white text-lux-primary/30 border border-lux-primary/10 hover:border-lux-accent/50 hover:text-lux-accent/50'}`}
                    title={tour.featured ? 'Remove from landing page' : 'Display on landing page'}
                  >
                    <Star className={`h-5 w-5 ${tour.featured ? 'fill-white' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

function SeasonalManager() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadTours = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/tour-packages?page=1'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to load tour packages.'); setTours([]); return; }

      const totalPages = data.totalPages || 1;
      let allTours = Array.isArray(data?.data) ? data.data : [];

      if (totalPages > 1) {
        for (let i = 2; i <= totalPages; i++) {
          const res = await fetch(getApiUrl(`/api/tour-packages?page=${i}`), { credentials: 'include' });
          const d = await parseJsonSafely(res);
          if (res.ok && Array.isArray(d?.data)) allTours = [...allTours, ...d.data];
        }
      }

      setTours(allTours.map(normalizeTourPackage).filter(Boolean) as TourPackage[]);
    } catch {
      setError('Unable to fetch tour packages.');
      setTours([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadTours(); }, []);

  const toggleSeasonal = async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/tour-packages/${id}/seasonal`), {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to update seasonal status.');
        return;
      }
      setSuccessMessage(data.message);
      setTours(tours.map(t => t.id === id ? { ...t, isSeasonal: !t.isSeasonal } : t));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setError('Network error updating status.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-6">
          <h3 className="font-headings text-2xl">Seasonal Packages Selection</h3>
          <p className="mt-2 text-sm text-lux-primary/65">
            Select which tour packages should appear in the "Seasonal Packages" section on your homepage.
            Click the snowflake icon to toggle.
          </p>
        </div>

        {error ? (
          <div className="m-6 flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="m-6 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-lux-primary/60">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading tours...
            </div>
          ) : tours.length === 0 ? (
            <div className="py-10 text-center text-sm text-lux-primary/50">No tour packages found.</div>
          ) : (
            <div className="space-y-3">
              {tours.map((tour) => (
                <div key={tour.id} className="flex items-center justify-between rounded-sm border border-lux-primary/10 bg-lux-bg/30 p-4 transition hover:border-lux-accent/30 hover:bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-sm bg-lux-bg">
                      {tour.image ? <img src={tour.image} alt="" className="h-full w-full object-cover" /> : null}
                    </div>
                    <div>
                      <h4 className="font-bold text-lux-primary">{tour.title}</h4>
                      <p className="text-xs text-lux-primary/60">{tour.id} • {tour.type || 'No type'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => void toggleSeasonal(tour.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${tour.isSeasonal ? 'bg-lux-accent text-white shadow-md' : 'bg-white text-lux-primary/30 border border-lux-primary/10 hover:border-lux-accent/50 hover:text-lux-accent/50'}`}
                    title={tour.isSeasonal ? 'Remove from seasonal section' : 'Add to seasonal section'}
                  >
                    <Snowflake className={`h-5 w-5 ${tour.isSeasonal ? 'fill-white' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

function TourTypeManager() {
  const [types, setTypes] = useState<{ _id: string, name: string, description?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/tour-types'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (response.ok && Array.isArray(data?.data)) {
        setTypes(data.data);
      }
    } catch {
      setError('Failed to fetch tour types');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadTypes(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(getApiUrl('/api/tour-types'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, description }),
      });
      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save tour type');
        return;
      }
      setSuccessMessage('Tour type added successfully');
      setName('');
      setDescription('');
      await loadTypes();
    } catch {
      setError('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tour type?')) return;
    try {
      const response = await fetch(getApiUrl(`/api/tour-types/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setSuccessMessage('Deleted successfully');
        await loadTypes();
      }
    } catch {
      setError('Failed to delete');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-6">
          <h3 className="font-headings text-2xl">Manage Tour Types</h3>
          <p className="mt-2 text-sm text-lux-primary/65">Define categories for your tour packages.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Type Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="e.g. Adventure" required />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description (Optional)</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Short description" />
            </label>
          </div>
          {error && <div className="text-rose-600 text-xs">{error}</div>}
          {successMessage && <div className="text-emerald-600 text-xs">{successMessage}</div>}
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-sm bg-lux-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-lux-primary/90 disabled:opacity-50">
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Tour Type
          </button>
        </form>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid gap-3">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-lux-primary/50">Loading...</div>
          ) : types.length === 0 ? (
            <div className="py-10 text-center text-sm text-lux-primary/50">No tour types defined yet.</div>
          ) : (
            types.map((t) => (
              <div key={t._id} className="flex items-center justify-between rounded-sm border border-lux-primary/10 bg-white p-4 shadow-sm">
                <div>
                  <h4 className="font-bold text-lux-primary">{t.name}</h4>
                  <p className="text-xs text-lux-primary/60">{t.description || 'No description'}</p>
                </div>
                <button onClick={() => void handleDelete(t._id)} className="text-rose-600 hover:text-rose-800 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.section>
    </div>
  );
}

function TourPackageManager() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<File[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<TourPackageFormState>(EMPTY_TOUR_FORM);
  const [tourTypes, setTourTypes] = useState<{ _id: string; name: string }[]>([]);

  const loadTours = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(getApiUrl('/api/tour-packages?page=1'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to load tour packages.'); setTours([]); return; }
      setTours((Array.isArray(data?.data) ? data.data.map(normalizeTourPackage).filter(Boolean) : []) as TourPackage[]);
    } catch {
      setError('Unable to fetch tour packages from the backend.');
      setTours([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTourTypes = async () => {
    try {
      const response = await fetch(getApiUrl('/api/tour-types'), { credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (response.ok && Array.isArray(data?.data)) {
        setTourTypes(data.data);
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    void loadTours();
    void loadTourTypes();
  }, []);

  const updateField = (field: keyof TourPackageFormState, value: string) =>
    setForm((cur) => ({ ...cur, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_TOUR_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setSelectedGallery([]);
    setIsFormOpen(false);
  };

  const startEditing = (tour: TourPackage) => {
    setForm(tourToFormState(tour));
    setEditingId(tour.id);
    setSelectedImage(null);
    setSelectedGallery([]);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitTour = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('id', form.id.trim());
      payload.append('title', form.title.trim());
      payload.append('destinations', JSON.stringify(form.destinations.split('\n').map((s) => s.trim()).filter(Boolean)));
      payload.append('duration', form.duration.trim());
      payload.append('price', form.price.trim());
      payload.append('type', form.type.trim());
      payload.append('description', form.description.trim());
      payload.append('image', form.image.trim());
      payload.append('gallery', form.gallery.trim());
      try { payload.append('itinerary', JSON.stringify(JSON.parse(form.itinerary || '[]'))); } catch { payload.append('itinerary', '[]'); }
      try { payload.append('tourPackages', JSON.stringify(JSON.parse(form.tourPackages || '[]'))); } catch { payload.append('tourPackages', '[]'); }

      if (selectedImage) payload.set('image', selectedImage);
      if (selectedGallery.length > 0) {
        selectedGallery.forEach(file => payload.append('gallery', file));
      }

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/tour-packages/${editingId}` : '/api/tour-packages'),
        { method: isEditing ? 'PUT' : 'POST', credentials: 'include', body: payload }
      );
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to save tour package.'); return; }
      setSuccessMessage(isEditing ? 'Tour package updated successfully.' : 'Tour package created successfully.');
      resetForm();
      await loadTours();
    } catch {
      setError('Unable to save tour package right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeTour = async (tourId: string) => {
    if (!window.confirm(`Delete tour package "${tourId}"?`)) return;
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(getApiUrl(`/api/tour-packages/${tourId}`), { method: 'DELETE', credentials: 'include' });
      const data = await parseJsonSafely(response);
      if (!response.ok) { setError(data?.message || 'Failed to delete tour package.'); return; }
      setSuccessMessage('Tour package deleted successfully.');
      if (editingId === tourId) resetForm();
      await loadTours();
    } catch {
      setError('Unable to delete tour package right now.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Tour Package API</p>
              <h3 className="mt-2 font-headings text-2xl">Tour Package Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">
                Connected to `GET /api/tour-packages`, `POST /api/tour-packages`, `PUT /api/tour-packages/:id`, and `DELETE /api/tour-packages/:id`.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setForm(EMPTY_TOUR_FORM); setEditingId(null); setSelectedImage(null); setError(''); setSuccessMessage(''); setIsFormOpen(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
            >
              <Plus className="h-4 w-4" />
              New Tour Package
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitTour}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Tour Package' : 'Create Tour Package'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">Fill all fields from the backend tour package schema.</p>
              </div>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Close
              </button>
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Tour ID</span>
              <input value={form.id} onChange={(e) => updateField('id', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="swiss-alpine-explorer" disabled={Boolean(editingId)} required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Title</span>
              <input value={form.title} onChange={(e) => updateField('title', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Swiss Alpine Explorer" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Duration</span>
              <input value={form.duration} onChange={(e) => updateField('duration', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="6 Days / 5 Nights" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Price</span>
              <input value={form.price} onChange={(e) => updateField('price', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Rs 3,200" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Type</span>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent appearance-none"
                required
              >
                <option value="">Select a type...</option>
                {tourTypes.map((t) => (
                  <option key={t._id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Image URL</span>
              <input value={form.image} onChange={(e) => updateField('image', e.target.value)} className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="https://..." />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Image</span>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm" />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Gallery Images</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => setSelectedGallery(Array.from(e.target.files || []))}
                className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm"
              />
              <p className="mt-1 text-[10px] text-lux-primary/40 italic">Select multiple images to add to the gallery.</p>
            </label>

            {form.gallery && (() => {
              try {
                const galleryItems = JSON.parse(form.gallery);
                if (Array.isArray(galleryItems) && galleryItems.length > 0) {
                  return (
                    <div className="lg:col-span-2">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Current Gallery</span>
                      <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8">
                        {galleryItems.map((img: string, idx: number) => (
                          <div key={idx} className="group relative aspect-square overflow-hidden rounded-sm border border-lux-primary/10 bg-lux-bg">
                            <img src={img} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = galleryItems.filter((_: any, i: number) => i !== idx);
                                updateField('gallery', JSON.stringify(updated));
                              }}
                              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
                            >
                              <Trash2 className="h-5 w-5 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch { return null; }
              return null;
            })()}

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Destinations (one per line)</span>
              <textarea value={form.destinations} onChange={(e) => updateField('destinations', e.target.value)} className="min-h-20 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder={"Switzerland\nAustria"} />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description</span>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="min-h-28 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent" placeholder="Describe the tour package..." />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Itinerary (JSON array)</span>
              <textarea value={form.itinerary} onChange={(e) => updateField('itinerary', e.target.value)} className="min-h-32 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 font-mono text-xs outline-none transition focus:border-lux-accent" placeholder={'[{"day":"Day 1","title":"Arrival","description":"Check in and explore."}]'} />
              <p className="mt-1 text-xs text-lux-primary/50">JSON array — each item needs day, title, description.</p>
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Tour Tiers (JSON array)</span>
              <textarea value={form.tourPackages} onChange={(e) => updateField('tourPackages', e.target.value)} className="min-h-32 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 font-mono text-xs outline-none transition focus:border-lux-accent" placeholder={'[{"tier":"Standard","price":"Rs 3,200","description":"Includes flights and hotel."}]'} />
              <p className="mt-1 text-xs text-lux-primary/50">JSON array — each item needs tier, price, description.</p>
            </label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? (
                  <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}
                {successMessage ? (
                  <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Tour Package' : 'Create Tour Package'}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">
            Click <span className="font-bold text-lux-primary">New Tour Package</span> to open the form.
          </div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Tour Packages</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live data from the backend tour package APIs.</p>
          </div>
          <button type="button" onClick={() => void loadTours()} className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" /> Loading tour packages...
          </div>
        ) : tours.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">No tour packages found yet.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {tours.map((tour) => (
              <article key={tour.id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                <div className="border-b border-lux-primary/10 bg-lux-bg/60 px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-lux-accent">{tour.id}</div>
                      <h4 className="mt-2 font-headings text-2xl">{tour.title}</h4>
                      <p className="mt-1 text-sm text-lux-primary/65">{tour.type || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => startEditing(tour)} className="inline-flex items-center gap-2 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => void removeTour(tour.id)} className="inline-flex items-center gap-2 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 px-5 py-5 text-sm text-lux-primary/75">
                  {tour.image ? <img src={tour.image} alt={tour.title} className="h-48 w-full rounded-sm object-cover" /> : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><span className="font-bold text-lux-primary">Duration:</span> {tour.duration || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Price:</span> {tour.price || '—'}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Destinations</div>
                    <div className="flex flex-wrap gap-2">
                      {(tour.destinations || []).length > 0
                        ? tour.destinations?.map((d) => <span key={d} className="rounded-sm bg-lux-bg px-3 py-1 text-xs">{d}</span>)
                        : <span className="text-lux-primary/50">—</span>}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Description</div>
                    <p>{tour.description || 'No description added.'}</p>
                  </div>
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Itinerary ({(tour.itinerary || []).length} days)</div>
                    <div className="space-y-2">
                      {(tour.itinerary || []).map((item, i) => (
                        <div key={i} className="rounded-sm bg-lux-bg px-3 py-2">
                          <span className="font-bold">{item.day} — {item.title}:</span> {item.description}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Tiers ({(tour.tourPackages || []).length})</div>
                    <div className="space-y-2">
                      {(tour.tourPackages || []).map((pkg, i) => (
                        <div key={i} className="rounded-sm bg-lux-bg px-3 py-2">
                          <span className="font-bold">{pkg.tier}</span> — {pkg.price}: {pkg.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function DestinationManager() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<DestinationFormState>(EMPTY_DESTINATION_FORM);

  const loadDestinations = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/destinations?page=1'), {
        credentials: 'include',
      });
      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || 'Failed to load destinations.');
        setDestinations([]);
        return;
      }

      const normalizedDestinations = Array.isArray(data?.data)
        ? data.data.map(normalizeDestination).filter(Boolean)
        : [];

      setDestinations(normalizedDestinations as Destination[]);
    } catch {
      setError('Unable to fetch destinations from the backend.');
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDestinations();
  }, []);

  const updateField = (field: keyof DestinationFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_DESTINATION_FORM);
    setEditingId(null);
    setSelectedImage(null);
    setSelectedGalleryFiles([]);
    setIsFormOpen(false);
  };

  const startEditing = (destination: Destination) => {
    setForm(destinationToFormState(destination));
    setEditingId(destination.id);
    setSelectedImage(null);
    setSelectedGalleryFiles([]);
    setIsFormOpen(true);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitDestination = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = new FormData();
      payload.append('id', form.id.trim());
      payload.append('name', form.name.trim());
      payload.append('location', form.location.trim());
      payload.append('tours', form.tours.trim());
      payload.append('description', form.description.trim());
      payload.append('image', form.image.trim());
      payload.append('highlights', JSON.stringify(linesToArray(form.highlights)));
      payload.append('price', form.price.trim());
      payload.append('duration', form.duration.trim());
      payload.append('expertTip', form.expertTip.trim());
      payload.append('cuisine', form.cuisine.trim());
      payload.append('whenToGo', form.whenToGo.trim());
      payload.append('latitude', form.latitude.trim());
      payload.append('longitude', form.longitude.trim());

      if (selectedImage) {
        payload.set('image', selectedImage);
      }

      if (selectedGalleryFiles.length > 0) {
        selectedGalleryFiles.forEach((file) => {
          payload.append('galleryFiles', file);
        });
      }

      const isEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(isEditing ? `/api/destinations/${editingId}` : '/api/destinations'),
        {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          body: payload,
        }
      );

      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to save destination.');
        return;
      }

      setSuccessMessage(isEditing ? 'Destination updated successfully.' : 'Destination created successfully.');
      resetForm();
      await loadDestinations();
    } catch {
      setError('Unable to save destination right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeDestination = async (destinationId: string) => {
    const shouldDelete = window.confirm(`Delete destination "${destinationId}"?`);
    if (!shouldDelete) {
      return;
    }

    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(getApiUrl(`/api/destinations/${destinationId}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await parseJsonSafely(response);
      if (!response.ok) {
        setError(data?.message || 'Failed to delete destination.');
        return;
      }

      setSuccessMessage('Destination deleted successfully.');
      if (editingId === destinationId) {
        resetForm();
      }
      await loadDestinations();
    } catch {
      setError('Unable to delete destination right now.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
        <div className="border-b border-lux-primary/10 bg-lux-bg/70 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lux-accent">Destination API</p>
              <h3 className="mt-2 font-headings text-2xl">Destination Manager</h3>
              <p className="mt-2 text-sm text-lux-primary/65">
                Connected to `GET /api/destinations`, `POST /api/destinations`, `PUT /api/destinations/:id`, and `DELETE /api/destinations/:id`.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_DESTINATION_FORM);
                setEditingId(null);
                setSelectedImage(null);
                setSelectedGalleryFiles([]);
                setError('');
                setSuccessMessage('');
                setIsFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
            >
              <Plus className="h-4 w-4" />
              New Destination
            </button>
          </div>
        </div>

        {isFormOpen ? (
          <form className="grid gap-5 p-6 lg:grid-cols-2" onSubmit={submitDestination}>
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h4 className="font-headings text-2xl">{editingId ? 'Edit Destination' : 'Create Destination'}</h4>
                <p className="mt-2 text-sm text-lux-primary/65">
                  Fill all destination content fields from the backend destination schema.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Destination ID</span>
              <input
                value={form.id}
                onChange={(event) => updateField('id', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="paris-france"
                disabled={Boolean(editingId)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Name</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="Paris"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Location</span>
              <input
                value={form.location}
                onChange={(event) => updateField('location', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="France"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Tours</span>
              <input
                value={form.tours}
                onChange={(event) => updateField('tours', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="18 tours"
              />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className="min-h-28 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="Describe the destination..."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Image URL</span>
              <input
                value={form.image}
                onChange={(event) => updateField('image', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="https://..."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Upload Image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
                className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Price</span>
              <input
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="Rs 1,800"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Duration</span>
              <input
                value={form.duration}
                onChange={(event) => updateField('duration', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="5 Days / 4 Nights"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Cuisine</span>
              <input
                value={form.cuisine}
                onChange={(event) => updateField('cuisine', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="French pastries and bistros"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">When To Go</span>
              <input
                value={form.whenToGo}
                onChange={(event) => updateField('whenToGo', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="April to June"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Latitude (for weather)</span>
              <input
                value={form.latitude}
                onChange={(event) => updateField('latitude', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="35.30"
                type="number"
                step="any"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Longitude (for weather)</span>
              <input
                value={form.longitude}
                onChange={(event) => updateField('longitude', event.target.value)}
                className="w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="75.57"
                type="number"
                step="any"
              />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Expert Tip</span>
              <textarea
                value={form.expertTip}
                onChange={(event) => updateField('expertTip', event.target.value)}
                className="min-h-24 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder="Best local travel advice..."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Gallery Images</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={(event) => setSelectedGalleryFiles(Array.from(event.target.files || []))}
                className="w-full rounded-sm border border-dashed border-lux-primary/20 bg-lux-bg px-4 py-3 text-sm"
              />
              <p className="mt-2 text-xs text-lux-primary/55">
                Upload one or more gallery images from your device.
              </p>
              {selectedGalleryFiles.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {selectedGalleryFiles.map((file) => (
                    <div key={`${file.name}-${file.size}`} className="rounded-sm bg-lux-bg px-3 py-2 text-xs text-lux-primary/70">
                      {file.name}
                    </div>
                  ))}
                </div>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/60">Highlights</span>
              <textarea
                value={form.highlights}
                onChange={(event) => updateField('highlights', event.target.value)}
                className="min-h-28 w-full rounded-sm border border-lux-primary/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-lux-accent"
                placeholder={'One highlight per line'}
              />
            </label>

            {(error || successMessage) ? (
              <div className="lg:col-span-2">
                {error ? (
                  <div className="flex items-start gap-3 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}
                {successMessage ? (
                  <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {successMessage}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-lux-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition hover:bg-lux-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update Destination' : 'Create Destination'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-lux-primary/65">
            Click <span className="font-bold text-lux-primary">New Destination</span> to open the destination form.
          </div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headings text-2xl">Saved Destinations</h3>
            <p className="mt-2 text-sm text-lux-primary/65">Live data from the backend destination APIs.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadDestinations()}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-lux-primary/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
          >
            <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-sm text-lux-primary/70">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-lux-accent" />
            Loading destinations...
          </div>
        ) : destinations.length === 0 ? (
          <div className="rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center text-sm text-lux-primary/65">
            No destinations found yet.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {destinations.map((destination) => (
              <article key={destination.id} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
                <div className="border-b border-lux-primary/10 bg-lux-bg/60 px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-lux-accent">{destination.id}</div>
                      <h4 className="mt-2 font-headings text-2xl">{destination.name}</h4>
                      <p className="mt-1 text-sm text-lux-primary/65">{destination.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(destination)}
                        className="inline-flex items-center gap-2 rounded-sm border border-lux-primary/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lux-primary transition hover:border-lux-accent hover:text-lux-accent"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeDestination(destination.id)}
                        className="inline-flex items-center gap-2 rounded-sm border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-5 text-sm text-lux-primary/75">
                  {destination.image ? (
                    <img src={destination.image} alt={destination.name} className="h-48 w-full rounded-sm object-cover" />
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><span className="font-bold text-lux-primary">Tours:</span> {destination.tours || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Price:</span> {destination.price || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Duration:</span> {destination.duration || '—'}</div>
                    <div><span className="font-bold text-lux-primary">When To Go:</span> {destination.whenToGo || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Latitude:</span> {destination.latitude || '—'}</div>
                    <div><span className="font-bold text-lux-primary">Longitude:</span> {destination.longitude || '—'}</div>
                  </div>

                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Description</div>
                    <p>{destination.description || 'No description added.'}</p>
                  </div>

                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Cuisine</div>
                    <p>{destination.cuisine || '—'}</p>
                  </div>

                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Expert Tip</div>
                    <p>{destination.expertTip || '—'}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Highlights</div>
                      <ul className="space-y-2">
                        {(destination.highlights || []).length > 0 ? (
                          destination.highlights?.map((highlight) => (
                            <li key={highlight} className="rounded-sm bg-lux-bg px-3 py-2">{highlight}</li>
                          ))
                        ) : (
                          <li className="rounded-sm bg-lux-bg px-3 py-2">No highlights added.</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lux-primary/55">Gallery</div>
                      <ul className="space-y-2 break-all">
                        {(destination.gallery || []).length > 0 ? (
                          destination.gallery?.map((imageUrl) => (
                            <li key={imageUrl} className="rounded-sm bg-lux-bg px-3 py-2">{imageUrl}</li>
                          ))
                        ) : (
                          <li className="rounded-sm bg-lux-bg px-3 py-2">No gallery images added.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

function Dashboard({
  admin,
  onLogout,
  isLoggingOut,
}: {
  admin: AdminUser | null;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(getApiUrl('/api/notifications'), { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setNotifications(data.data || []);

      const countRes = await fetch(getApiUrl('/api/notifications/unread-count'), { credentials: 'include' });
      const countData = await countRes.json();
      if (countRes.ok) setUnreadCount(countData.count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/notifications/${id}/read`), {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(getApiUrl('/api/notifications/read-all'), {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getPageTitle = () => {
    const currentItem = SIDEBAR_ITEMS.find((item) => item.id === activeTab);
    return currentItem?.label || 'Overview';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-lux-bg font-body text-lux-primary">
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col bg-lux-primary text-white transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-lux-accent to-lux-primary" />

        <div className="flex items-center justify-between p-8">
          <div>
            <h1 className="font-headings text-2xl font-bold tracking-wider">LUXE</h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/50">Admin Portal</p>
          </div>
          <button className="text-white/60 hover:text-white md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-2 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-4 rounded-sm border-l-2 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest transition-all duration-300 ${isActive
                    ? 'border-lux-accent bg-white/10 text-lux-accent'
                    : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-4 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoggingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {isLoggingOut ? 'Signing Out' : 'Sign Out'}
          </button>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-20 flex-shrink-0 items-center justify-between border-b border-lux-primary/10 bg-white/50 px-6 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-4">
            <button className="p-2 text-lux-primary/60 hover:text-lux-primary md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="hidden font-headings text-2xl sm:block">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="group relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lux-primary/40 transition-colors group-focus-within:text-lux-accent" />
              <input
                type="text"
                placeholder="Search packages, destinations..."
                className="w-48 rounded-sm border border-lux-primary/20 bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-lux-accent focus:outline-none focus:ring-1 focus:ring-lux-accent lg:w-64"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-lux-primary/60 transition-colors hover:text-lux-primary"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-lux-accent text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 z-50 overflow-hidden rounded-sm border border-lux-primary/10 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between border-b border-lux-primary/5 bg-lux-bg/50 px-4 py-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] font-bold text-lux-accent hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-lux-primary/50 italic">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                              if (notif.link) {
                                setActiveTab(notif.link.replace('/', ''));
                                setIsNotifOpen(false);
                              }
                            }}
                            className={`group relative border-b border-lux-primary/5 p-4 transition-colors hover:bg-lux-bg/50 cursor-pointer ${!notif.isRead ? 'bg-lux-accent/[0.03]' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!notif.isRead ? 'bg-lux-accent animate-pulse' : 'bg-gray-300'}`} />
                              <div>
                                <p className={`text-xs font-bold leading-none ${!notif.isRead ? 'text-lux-primary' : 'text-lux-primary/60'}`}>{notif.title}</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-lux-primary/65">{notif.message}</p>
                                <p className="mt-2 text-[9px] uppercase tracking-widest text-lux-primary/40">{new Date(notif.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => { setActiveTab('dashboard'); setIsNotifOpen(false); }}
                        className="w-full border-t border-lux-primary/5 bg-white py-3 text-center text-[10px] font-bold uppercase tracking-widest text-lux-primary/60 hover:text-lux-accent"
                      >
                        View All Activity
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="hidden h-8 w-px bg-lux-primary/10 sm:block" />
            <div className="group flex cursor-pointer items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-transparent bg-lux-primary/10 transition-colors group-hover:border-lux-accent lg:h-10 lg:w-10">
                <UserRound className="h-5 w-5 text-lux-primary/60" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold">{admin?.name || 'Admin User'}</p>
                <p className="text-[10px] uppercase tracking-widest text-lux-primary/60">{admin?.email || 'Authenticated admin'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {activeTab === 'dashboard' ? <DashboardOverview /> : null}
          {activeTab === 'heroes' ? <HeroManager /> : null}
          {activeTab === 'destinations' ? <DestinationManager /> : null}
          {activeTab === 'blogs' ? <BlogManager /> : null}
          {activeTab === 'rental-vehicles' ? <RentalVehicleManager /> : null}
          {activeTab === 'vehicle-categories' ? <VehicleCategoryManager /> : null}
          {activeTab === 'jeep-safaris' ? <JeepSafariManager /> : null}
          {activeTab === 'safari-categories' ? <JeepSafariCategoryManager /> : null}
          {activeTab === 'tour-guides' ? <TourGuideManager /> : null}
          {activeTab === 'guide-specialties' ? <TourGuideSpecialtyManager /> : null}
          {activeTab === 'hotels' ? <HotelManager /> : null}
          {activeTab === 'hotel-categories' ? <HotelCategoryManager /> : null}
          {activeTab === 'packages' ? <TourPackageManager /> : null}
          {activeTab === 'tour-types' ? <TourTypeManager /> : null}
          {activeTab === 'featured-tours' ? <FeaturedManager /> : null}
          {activeTab === 'seasonal-tours' ? <SeasonalManager /> : null}
          {activeTab === 'testimonials' ? <TestimonialManager /> : null}
          {activeTab === 'team' ? <TeamManager /> : null}
          {activeTab === 'promo-modal' ? <PromoModalManager /> : null}
          {activeTab === 'quotes' ? <Quotes /> : null}
          {activeTab === 'enquiries' ? <Enquiries /> : null}
          {activeTab !== 'dashboard' && activeTab !== 'heroes' && activeTab !== 'destinations' && activeTab !== 'blogs' && activeTab !== 'rental-vehicles' && activeTab !== 'vehicle-categories' && activeTab !== 'jeep-safaris' && activeTab !== 'safari-categories' && activeTab !== 'tour-guides' && activeTab !== 'guide-specialties' && activeTab !== 'hotels' && activeTab !== 'hotel-categories' && activeTab !== 'packages' && activeTab !== 'tour-types' && activeTab !== 'featured-tours' && activeTab !== 'seasonal-tours' && activeTab !== 'testimonials' && activeTab !== 'team' && activeTab !== 'promo-modal' && activeTab !== 'quotes' && activeTab !== 'enquiries' ? (
            <div className="mx-auto max-w-5xl rounded-sm border border-lux-primary/10 bg-white px-6 py-16 text-center shadow-sm">
              <h3 className="font-headings text-3xl">{getPageTitle()}</h3>
              <p className="mt-4 text-sm text-lux-primary/65">
                This section is still using placeholder admin content. The destinations module is fully connected to the backend APIs.
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [sessionState, setSessionState] = useState<SessionState>('checking');
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(getApiUrl('/api/admin/me'), {
          credentials: 'include',
        });

        if (!response.ok) {
          setAdmin(null);
          setSessionState('unauthenticated');
          return;
        }

        const data = await parseJsonSafely(response);
        const validatedAdmin = getValidatedAdmin(data);

        if (!validatedAdmin) {
          setAdmin(null);
          setSessionState('unauthenticated');
          return;
        }

        setAdmin(validatedAdmin);
        setSessionState('authenticated');
      } catch {
        setAdmin(null);
        setSessionState('unauthenticated');
      }
    };

    void checkSession();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || 'Unable to sign in. Please check your credentials.');
        setSessionState('unauthenticated');
        return;
      }

      const sessionResponse = await fetch(getApiUrl('/api/admin/me'), {
        credentials: 'include',
      });
      const sessionData = await parseJsonSafely(sessionResponse);
      const validatedAdmin = sessionResponse.ok ? getValidatedAdmin(sessionData) : null;

      if (!validatedAdmin) {
        setAdmin(null);
        setError('Login did not create a valid admin session. Please check backend cookies and API routing.');
        setSessionState('unauthenticated');
        return;
      }

      setAdmin(validatedAdmin);
      setSessionState('authenticated');
    } catch {
      setError('Unable to reach the admin API. Confirm the backend is running and connected.');
      setSessionState('unauthenticated');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch(getApiUrl('/api/admin/logout'), {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setAdmin(null);
      setError('');
      setSessionState('unauthenticated');
      setIsLoggingOut(false);
    }
  };

  if (sessionState === 'checking') {
    return <LoadingScreen />;
  }

  if (sessionState !== 'authenticated') {
    return <LoginPage onLogin={handleLogin} isSubmitting={isSubmitting} error={error} />;
  }

  return <Dashboard admin={admin} onLogout={handleLogout} isLoggingOut={isLoggingOut} />;
}
