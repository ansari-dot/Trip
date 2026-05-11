import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  Snowflake,
  Star,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import Quotes from './pages/Quotes';

const SIDEBAR_ITEMS = [
  {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {id: 'heroes', label: 'Hero Slides', icon: ArrowUpRight},
  {id: 'destinations', label: 'Destinations', icon: MapPin},
  {id: 'packages', label: 'Tour Packages', icon: Package},
  {id: 'tour-types', label: 'Tour Types', icon: Tags},
  {id: 'featured-tours', label: 'Featured Tours', icon: Star},
  {id: 'seasonal-tours', label: 'Seasonal Selection', icon: Snowflake},
  {id: 'testimonials', label: 'Testimonials', icon: Users},
  {id: 'promo-modal', label: 'Promo Modal', icon: AlertCircle},
  {id: 'quotes', label: 'Quote Requests', icon: MessageSquare},
  {id: 'settings', label: 'Settings', icon: Settings},
];

const STATS = [
  {label: 'Total Revenue', value: 'Rs 845,200', change: '+12.5%', isUp: true},
  {label: 'Active Packages', value: '14', change: '+2.0%', isUp: true},
  {label: 'New Guests', value: '28', change: '-2.1%', isUp: false},
  {label: 'Avg. Package Cost', value: 'Rs 5,950', change: '+8.4%', isUp: true},
];

const RECENT_PACKAGES = [
  {id: 'PKG-001', name: 'Swiss Alpine Explorer', location: 'Switzerland', duration: '6 Days / 5 Nights', status: 'Active'},
  {id: 'PKG-002', name: 'Austrian Majesty', location: 'Austria', duration: '8 Days / 7 Nights', status: 'Draft'},
  {id: 'PKG-003', name: 'Classic European Tour', location: 'Europe', duration: '12 Days / 11 Nights', status: 'Active'},
  {id: 'PKG-004', name: 'Italian Romance', location: 'Italy', duration: '7 Days / 6 Nights', status: 'Active'},
  {id: 'PKG-005', name: 'Scottish Highlands', location: 'Scotland', duration: '7 Days / 6 Nights', status: 'Draft'},
];

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '')
).replace(/\/$/, '');

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
};

function getApiUrl(path: string) {
  return `${API_BASE}${path}`;
}

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

  const admin = (data as {admin?: unknown}).admin;
  if (!admin || typeof admin !== 'object') {
    return null;
  }

  const email = (admin as {email?: unknown}).email;
  if (typeof email !== 'string' || !email.trim()) {
    return null;
  }

  const name = (admin as {name?: unknown}).name;
  const id = (admin as {_id?: unknown})._id;

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
            initial={{opacity: 0, y: 24}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.08}}
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
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="group relative overflow-hidden border border-lux-primary/10 bg-white p-5 shadow-sm lg:p-6">
            <div className="absolute right-0 top-0 -z-10 h-24 w-24 rounded-bl-full bg-lux-bg transition-transform duration-500 group-hover:scale-110" />
            <p className="mb-2 text-[10px] uppercase tracking-widest text-lux-primary/60 sm:text-xs">{stat.label}</p>
            <div className="flex items-end gap-3 lg:gap-4">
              <h3 className="font-headings text-2xl lg:text-3xl">{stat.value}</h3>
              <div className={`mb-1 flex items-center gap-1 text-[10px] font-medium lg:text-xs ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-3 font-headings text-xl lg:text-2xl">
            <span className="hidden h-px w-6 bg-lux-accent sm:block" />
            Recent Tour Packages
          </h3>
          <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-lux-accent transition-colors hover:text-lux-primary lg:text-xs">
            View All <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-lux-primary/10 bg-lux-bg text-[10px] uppercase tracking-widest text-lux-primary/60">
                  <th className="px-6 py-4 font-medium">Package & ID</th>
                  <th className="px-6 py-4 font-medium">Destination</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {RECENT_PACKAGES.map((pkg, index) => (
                  <tr key={pkg.id} className={`transition-colors hover:bg-lux-bg/50 ${index === RECENT_PACKAGES.length - 1 ? '' : 'border-b border-lux-primary/5'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-lux-accent/70" />
                        <div>
                          <div className="font-bold">{pkg.name}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-lux-primary/50">{pkg.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-lux-primary/70">{pkg.location}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{pkg.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        pkg.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                      }`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-lux-primary/40 transition-colors hover:text-lux-primary">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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

const EMPTY_TESTIMONIAL_FORM: TestimonialFormState = {
  quote: '',
  name: '',
  location: '',
  image: '',
};

function normalizeTestimonial(input: unknown): Testimonial | null {
  if (!input || typeof input !== 'object') return null;
  const t = input as Testimonial;
  if (!t._id || !t.quote || !t.name) return null;
  return { _id: t._id, quote: t.quote, name: t.name, location: t.location || '', image: t.image || '' };
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
      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
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

      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.05}}>
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
      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
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
      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
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

      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.05}}>
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
      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
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
      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
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
      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
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

      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}}>
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
      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
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

      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.05}}>
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
    window.scrollTo({top: 0, behavior: 'smooth'});
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
      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="overflow-hidden border border-lux-primary/10 bg-white shadow-sm">
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

      <motion.section initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.05}}>
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

        <nav className="mt-6 flex flex-1 flex-col gap-2 px-4">
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
                className={`flex w-full items-center gap-4 rounded-sm border-l-2 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive
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
          {activeTab === 'packages' ? <TourPackageManager /> : null}
          {activeTab === 'tour-types' ? <TourTypeManager /> : null}
          {activeTab === 'featured-tours' ? <FeaturedManager /> : null}
          {activeTab === 'seasonal-tours' ? <SeasonalManager /> : null}
          {activeTab === 'testimonials' ? <TestimonialManager /> : null}
          {activeTab === 'promo-modal' ? <PromoModalManager /> : null}
          {activeTab === 'quotes' ? <Quotes /> : null}
          {activeTab !== 'dashboard' && activeTab !== 'heroes' && activeTab !== 'destinations' && activeTab !== 'packages' && activeTab !== 'tour-types' && activeTab !== 'featured-tours' && activeTab !== 'seasonal-tours' && activeTab !== 'testimonials' && activeTab !== 'promo-modal' && activeTab !== 'quotes' ? (
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
        body: JSON.stringify({email, password}),
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
