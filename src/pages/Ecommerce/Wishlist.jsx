import { Helmet } from "react-helmet-async";
import EcomHeader from "../../components/EcomHeader";
import ProductNoSlider from "../../components/EcommerceHomeSlider/ProductNoSlider";
import { useWishlist } from "../../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

const Wishlist = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/wishlist`;

  const pageTitle = "My Wishlist | Prospect Ecommerce";
  const pageDescription =
    "View your saved items on Prospect Ecommerce. Add products to wishlist and shop anytime.";

  return (
    <section className=" pt-36">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Private page */}
        <meta name="robots" content="noindex, nofollow" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <EcomHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 pb-20 text-left">
        <p className="text-gray-600 text-sm md:text-md mb-5">
          <span
            className="cursor-pointer text-[#124734] hover:underline"
            onClick={() => navigate("/ecommerce-home")}
          >
            Home
          </span>{" "}
          &gt; My Wishlist
        </p>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 py-6 md:py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#124734]">
            My Wishlist
          </h1>
        </div>

        {wishlist.length === 0 && (
          <p className="text-lg md:text-xl text-gray-500 mt-4">
            No items in your wishlist.
          </p>
        )}

        {wishlist.length > 0 && (
          <ProductNoSlider
            products={wishlist}
            cartItems={[]}
            onCart={() => {}}
            columns={3}
          />
        )}
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default Wishlist;
