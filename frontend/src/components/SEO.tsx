import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title = "North Paradise Treks and Tours | Best Northern Pakistan Tour Packages",
  description = "North Paradise Treks and Tours offers premium and luxury tour packages to Northern Pakistan, including Hunza, Skardu, Gilgit, and Fairy Meadows. Book your dream trip today!",
  keywords = "Northern Pakistan tours, Gilgit Baltistan trip, Skardu tour packages, Hunza Valley tourism, Fairy Meadows trek, luxury tours Pakistan, adventure trips Pakistan, North Paradise Treks and Tours, Pakistan travel agency, Karakoram Highway tour, K2 base camp trek, Attabad Lake, Khunjerab Pass, Passu Cones, Shangrila Resort, Kachura Lake, Northern Areas Pakistan, family vacation Pakistan, corporate tours Gilgit, honeymoon in Hunza",
  image = "/og-image.jpg",
  url = "https://northparadisetreksandtours.com",
  type = "website",
}: SEOProps) => {
  const siteTitle = title.includes("North Paradise") ? title : `${title} | North Paradise Treks and Tours`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
    </Helmet>
  );
};

export default SEO;
