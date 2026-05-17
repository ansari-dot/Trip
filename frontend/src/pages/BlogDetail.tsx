import { useEffect, useMemo, useState } from "react";
import { getApiUrl, parseJsonSafely, API_BASE } from "../lib/api";
import { Link, useParams } from "react-router-dom";
import { Calendar, ChevronLeft, LoaderCircle, Tag, UserRound } from "lucide-react";
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

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      if (!id) {
        setError("Blog not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(getApiUrl(`/api/blogs/${id}`));
        const data = await parseJsonSafely(response);
        if (!response.ok) {
          setError(data?.message || "Failed to load blog.");
          setBlog(null);
          return;
        }

        const normalizedBlog = normalizeBlog(data?.data);
        if (!normalizedBlog) {
          setError("Blog not found.");
          setBlog(null);
          return;
        }

        setBlog(normalizedBlog);
      } catch {
        setError("Unable to load blog details.");
        setBlog(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBlog();
  }, [id]);

  const contentParagraphs = useMemo(() => {
    if (!blog?.content) return [];
    return blog.content
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [blog?.content]);

  if (isLoading) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-3 bg-white border border-border rounded-sm px-5 py-4 shadow-sm">
          <LoaderCircle className="w-5 h-5 animate-spin text-lux-accent" />
          <span className="text-sm">Loading blog...</span>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-lux-bg text-lux-primary min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-headings text-4xl mb-4">Blog Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "This blog could not be found."}</p>
        <Link to="/blogs" className="text-lux-accent hover:underline">Return to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="bg-lux-bg text-lux-primary font-body min-h-screen flex flex-col">
      <SEO
        title={blog.seoTitle || `${blog.title} | North Paradise Blog`}
        description={blog.seoDescription || blog.excerpt || blog.content.slice(0, 160)}
        keywords={blog.seoKeywords || blog.tags?.join(", ") || "Northern Pakistan blog"}
        image={blog.image}
      />
      <Navbar />

      <section
        className="relative flex min-h-[320px] items-end bg-cover bg-center pb-10 pt-28 sm:min-h-[520px] sm:pb-16 sm:pt-0"
        style={{ backgroundImage: `url('${blog.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1800"}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-white sm:px-8 lg:px-12">
          <Link to="/blogs" className="mb-4 inline-flex items-center text-xs uppercase tracking-wider transition-colors hover:text-lux-accent sm:mb-6 sm:text-sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Blogs
          </Link>
          <div className="max-w-4xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-lux-accent sm:text-sm">
              <Tag className="h-4 w-4" />
              {blog.category || "Blog"}
            </p>
            <h1 className="font-headings text-3xl leading-[1.08] sm:text-5xl lg:text-7xl">{blog.title}</h1>
            {blog.excerpt ? <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-white/85 sm:text-lg">{blog.excerpt}</p> : null}
            <div className="mt-6 flex flex-col gap-3 text-sm text-white/80 sm:flex-row sm:items-center sm:gap-6">
              <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-lux-accent" /> {blog.author || "North Paradise Team"}</span>
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-lux-accent" /> {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "Recently published"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full flex-1 px-0 py-12 sm:py-20">
        <article className="w-full bg-white px-0 py-6 sm:py-10">
          <div className="prose prose-neutral max-w-none px-4 sm:px-6 lg:px-8">
            {contentParagraphs.length > 0 ? (
              contentParagraphs.map((paragraph, index) => (
                <p key={index} className="mb-6 text-[15px] leading-8 text-lux-primary/75 sm:text-lg">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-lg leading-8 text-lux-primary/75">Content will be added soon.</p>
            )}
          </div>

          {blog.tags && blog.tags.length > 0 ? (
            <div className="mt-10 border-t border-border px-4 pt-6 sm:px-6 lg:px-8">
              <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.26em] text-lux-primary/50">Related Topics</div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-lux-accent/20 bg-lux-bg px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-lux-primary/70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}
