import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AnnouncementBar from '../components/AnnouncementBar';
import HeroCarousel from '../components/HeroCarousel';
import CollectionGrid from '../components/CollectionGrid';
import FeaturedProducts from '../components/FeaturedProducts';
import BundleSection from '../components/BundleSection';
import TrustBadges from '../components/TrustBadges';
import InstagramFeed from '../components/InstagramFeed';
import Newsletter from '../components/Newsletter';

export default function Home() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>vybebd.store - Premium Posters & Wall Art | Turn Your Walls Into Vibes</title>
        <meta 
          name="description" 
          content="Shop premium quality posters and wall art in Bangladesh. Music, movies, anime, sports & aesthetic posters. Fast delivery, secure checkout, best prices." 
        />
        <meta 
          name="keywords" 
          content="posters bangladesh, wall art bd, music posters, movie posters, anime posters, aesthetic posters, premium posters dhaka" 
        />
        <link rel="canonical" href="https://vybebd.store" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vybebd.store" />
        <meta property="og:title" content="vybebd.store - Premium Posters & Wall Art Bangladesh" />
        <meta property="og:description" content="Turn your walls into vibes with premium quality posters. Free delivery on orders over ৳999." />
        <meta property="og:image" content="https://vybebd.store/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://vybebd.store" />
        <meta property="twitter:title" content="vybebd.store - Premium Posters & Wall Art" />
        <meta property="twitter:description" content="Turn your walls into vibes with premium quality posters. Free delivery on orders over ৳999." />
        <meta property="twitter:image" content="https://vybebd.store/og-image.jpg" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Announcement Bar */}
        <AnnouncementBar />

        {/* Hero Section */}
        <HeroCarousel />

        {/* Collection Grid */}
        <CollectionGrid />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Bundle Section */}
        <BundleSection />

        {/* Instagram Feed */}
        <InstagramFeed />

        {/* Newsletter */}
        <Newsletter />
      </div>
    </>
  );
}
