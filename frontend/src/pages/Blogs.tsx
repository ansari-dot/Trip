import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, LoaderCircle, Search, Tag, X } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

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

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/$/, "");

const PAGE_SIZE = 6;

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

function normalizeBlog(input: unknown): Blog | null {
  if (!input || typeof input !== "object") return null;
  const blog = input as Blog;
  if (!blog.id || !blog.title || !blog.content) return null;
  return {
    _id: blog._id,
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt || "",
    content: blog.content,
    image: blog.image || "",
    category: blog.category || "",
    author: blog.author || "",
    tags: Array.isArray(blog.tags) ? blog.tags : [],
    seoTitle: blog.seoTitle || "",
    seoDescription: blog.seoDescription || "",
    seoKeywords: blog.seoKeywords || "",
    publishedAt: blog.publishedAt || "",
  };
}

export default function Blogs() {
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setError("");
      try {
        const first = await fetch(getApiUrl("/api/blogs?page=1"));
        const firstData = await parseJsonSafely(first);
        if (!first.ok) {
          setError(firstData?.message || "Failed to load blogs.");
          setAllBlogs([]);
          return;
        }

        const totalPages = Math.max(Number(firstData?.totalPages) || 1, 1);
        const collected: Blog[] = (Array.isArray(firstData?.data) ? firstData.data.map(normalizeBlog).filter(Boolean) : []) as Blog[];

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(getApiUrl(`/api/blogs?page=${i + 2}`)).then(parseJsonSafely)
            )
          );
          rest.forEach((data) => {
            if (Array.isArray(data?.data)) {
              (data.data.map(normalizeBlog).filter(Boolean) as Blog[]).forEach((blog) => collected.push(blog));
            }
          });
        }

        setAllBlogs(collected);
      } catch {
        setError("Unable to load blog articles from the server.");
        setAllBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(allBlogs.map((blog) => blog.category?.trim()).filter(Boolean) as string[])).sort()], [allBlogs]);

  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((blog) => {
      if (selectedCategory !== "All" && (blog.category || "").trim() !== selectedCategory) return false;
      if (searchQuery) {
        const needle = searchQuery.toLowerCase();
        if (
          !blog.title.toLowerCase().includes(needle) &&
          !(blog.excerpt || "").toLowerCase().includes(needle) &&
          !blog.content.toLowerCase().includes(needle) &&
          !(blog.category || "").toLowerCase().includes(needle)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allBlogs, searchQuery, selectedCategory]);

  const totalPages = Math.max(Math.ceil(filteredBlogs.length / PAGE_SIZE), 1);
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO
        title="Travel Blog | Northern Pakistan Guides and Tips"
        description="Read travel blogs, destination guides, and expert planning tips for Northern Pakistan from North Paradise Treks and Tours."
        keywords="Northern Pakistan blog, Hunza travel guide, Skardu travel tips, Pakistan tourism blog"
      />
      <Navbar />

      <section className="relative pt-28 sm:pt-32 pb-10 sm:pb-12 bg-lux-bg text-lux-primary px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="text-lux-accent text-xs uppercase tracking-[0.4em] font-bold mb-4">Travel Journal</div>
              <h1 className="font-headings text-3xl sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-[1.1]">
                Stories, Guides <br />
                <span className="text-lux-accent italic font-light font-body">& Expert Advice</span>
              </h1>
            </div>
            <div className="lg:pb-4">
              <p className="text-base opacity-70 max-w-xl font-light leading-relaxed mb-6">
                Explore blog articles designed to help travelers discover Northern Pakistan, plan better itineraries, and learn from local travel expertise.
              </p>
              <div className="w-20 h-px bg-lux-accent" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-12 py-10 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-sm border border-border bg-white px-4 py-3">
              <Search className="h-4 w-4 text-lux-primary/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search blog articles..."
                className="w-full bg-transparent text-sm outline-none"
              />
              {searchQuery ? (
                <button type="button" onClick={() => setSearchQuery("")} className="text-lux-primary/40 hover:text-lux-primary">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                    selectedCategory === category
                      ? "border-lux-primary bg-lux-primary text-white"
                      : "border-border bg-white text-lux-primary hover:border-lux-accent hover:text-lux-accent"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {!isLoading && !error ? (
            <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {filteredBlogs.length} article{filteredBlogs.length !== 1 ? "s" : ""} found
              </p>
              {(searchQuery || selectedCategory !== "All") ? (
                <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-lux-accent hover:text-lux-primary">
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : null}

          {isLoading ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
                <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
                <span className="text-sm">Loading blogs...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">Unable to Load Blogs</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-lux-primary text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                Try Again
              </button>
            </div>
          ) : paginatedBlogs.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="font-headings text-2xl mb-2">No Blogs Found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or category.</p>
              <button onClick={clearFilters} className="bg-lux-primary text-white px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedBlogs.map((blog) => (
                <Link key={blog.id} to={`/blogs/${blog.id}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-sm">
                  <div
                    className="h-56 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${blog.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1200"}')` }}
                  />
                  <div className="space-y-4 p-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-lux-accent">
                      <Tag className="h-3.5 w-3.5" />
                      {blog.category || "Blog"}
                    </div>
                    <h2 className="font-headings text-2xl leading-tight transition-colors group-hover:text-lux-accent">{blog.title}</h2>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{blog.excerpt || blog.content}</p>
                    <div className="flex items-center justify-between gap-4 border-t border-border pt-4 text-xs uppercase tracking-[0.16em] text-lux-primary/55">
                      <span>{blog.author || "North Paradise Team"}</span>
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-lux-accent" />
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "Recently"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !error && totalPages > 1 ? (
            <div className="mt-16 flex justify-center">
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} disabled={currentPage === 1} className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:bg-lux-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${currentPage === page ? "border-lux-primary bg-lux-primary text-white" : "border-border hover:bg-lux-primary hover:text-white"}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))} disabled={currentPage === totalPages} className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:bg-lux-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
