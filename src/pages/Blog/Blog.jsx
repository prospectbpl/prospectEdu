import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import blogImg from "../../assets/blog.webp";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import { fetchPublicBlogs } from "../../lib/blogApi";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/blog`;

  const pageTitle = "Blog | ProspectEdu";
  const pageDescription =
    "Explore helpful blogs from ProspectEdu—technology, education, careers, and more. Simple explanations and useful insights.  ";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPublicBlogs();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const jsonLd = useMemo(() => {
    const itemList = (blogs || []).slice(0, 50).map((b, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/blog/${b.slug}`,
      name: b.title,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      blogPost: itemList.map((x) => ({
        "@type": "BlogPosting",
        headline: x.name,
        url: x.url,
      })),
    };
  }, [blogs, SITE_URL, canonicalUrl]);

  return (
    <section className="bg-[#F9FAFB] text-[#124734] font-[Open_Sans,sans-serif]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${SITE_URL}${blogImg}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}${blogImg}`} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <HeaderSection
        page="Blog"
        title="Blogs made simple."
        subtitle="Explore helpful blogs written in a simple way. Stay updated with
        ideas, insights, and useful information from technology, education,
        careers, and many more fields."
        image={blogImg}
      />

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        {loading ? (
          <p className="text-center text-gray-600">Loading blogs...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {blogs.map((blog) => (
              <article
                key={blog.slug}
                className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white"
              >
                <img
                  src={blog.coverUrl || blogImg}
                  alt={blog.title}
                  className="w-full h-48 sm:h-52 object-contain bg-[#F9FAFB]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
                  <p className="text-sm mb-4">{blog.subtitle}</p>

                  <Link
                    to={`/blog/${blog.slug}`}
                    className="inline-block px-4 py-2 bg-[#1E5631] text-white rounded-lg text-sm"
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default Blog;
