import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import blogImg from "../../assets/blog.webp";
import whatsappIcon from "../../assets/whatsapp.webp";
import linkedinIcon from "../../assets/linkedin.webp";
import HeaderSection from "../../components/HeaderSection";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer";
import { fetchBlogBySlug } from "../../lib/blogApi";

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBlogBySlug(slug);
        setBlog(data);
      } catch (e) {
        console.error(e);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const pageTitle = useMemo(() => {
    if (!blog?.title) return "Blog | ProspectEdu";
    return `${blog.title} | ProspectEdu`;
  }, [blog]);

  const pageDescription = useMemo(() => {
    if (blog?.subtitle) return blog.subtitle;
    const text = (blog?.content || "").toString().replace(/\s+/g, " ").trim();
    return text ? text.slice(0, 155) : "Read helpful blogs from ProspectEdu.";
  }, [blog]);

  const ogImage = useMemo(() => {
    const img = blog?.coverUrl || blogImg;
    if (typeof img === "string" && /^https?:\/\//i.test(img)) return img;
    return `${SITE_URL}${img}`;
  }, [blog, SITE_URL]);

  const jsonLd = useMemo(() => {
    if (!blog) return null;

    const published = blog?.createdAt ? new Date(blog.createdAt).toISOString() : undefined;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: pageDescription,
      image: [ogImage],
      url: canonicalUrl,
      datePublished: published,
      author: { "@type": "Person", name: "Teacher" },
      publisher: { "@type": "Organization", name: "ProspectEdu", url: SITE_URL },
      mainEntityOfPage: canonicalUrl,
    };
  }, [blog, pageDescription, ogImage, canonicalUrl, SITE_URL]);

  if (loading) return <p className="text-center mt-20 text-lg">Loading...</p>;
  if (!blog) return <p className="text-center mt-20 text-lg">Blog not found</p>;

  const shareOnWhatsApp = () => {
    const message = `Check out this blog: ${blog.title}\n\n${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(url, "_blank");
  };

  return (
    <section className="bg-[#F9FAFB] text-[#124734] font-[Open_Sans,sans-serif]">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        {jsonLd ? (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        ) : null}
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

      <main className="max-w-4xl mx-auto px-6 md:px-8 py-16 text-left">
        <article className="bg-[#A7E1B2] rounded-2xl shadow-lg p-6 md:p-10">
          <img
            src={blog.coverUrl || blogImg}
            alt={blog.title}
            className="w-full h-56 sm:h-64 md:h-72 object-contain bg-white rounded-xl mb-8"
            loading="lazy"
            decoding="async"
          />

          {/* ✅ h1 for SEO, styling kept same as your h2 */}
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{blog.title}</h1>
          <div className="h-[4px] w-40 bg-[#124734] mb-6"></div>

          <p className="text-sm mb-4">
            <b>Author:</b> Teacher &nbsp; | &nbsp;
            <b>Published:</b> {new Date(blog.createdAt).toLocaleDateString("en-GB")}
          </p>

          <p className="text-lg leading-7 whitespace-pre-line">{blog.content}</p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={shareOnWhatsApp}
              className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full"
              type="button"
              aria-label="Share this blog on WhatsApp"
            >
              <img
                src={whatsappIcon}
                className="w-5 h-5"
                alt="WhatsApp"
                loading="lazy"
                decoding="async"
              />
              Share on WhatsApp
            </button>

            <button
              onClick={shareOnLinkedIn}
              className="flex items-center gap-2 bg-[#0A66C2] text-white px-4 py-2 rounded-full"
              type="button"
              aria-label="Share this blog on LinkedIn"
            >
              <img
                src={linkedinIcon}
                className="w-5 h-5"
                alt="LinkedIn"
                loading="lazy"
                decoding="async"
              />
              Share on LinkedIn
            </button>
          </div>
        </article>
      </main>

      <Footer />
    </section>
  );
};

export default BlogDetails;
