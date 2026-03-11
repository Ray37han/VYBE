import { useEffect, useState } from 'react';
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
  const [darkMode, setDarkMode] = useState(() => {
    // Check system preference on initial load if no saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      setDarkMode(currentTheme === 'dark');
    };

    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://vybebd.store" />
        <meta name="twitter:title" content="vybebd.store - Premium Posters & Wall Art" />
        <meta name="twitter:description" content="Turn your walls into vibes with premium quality posters. Free delivery on orders over ৳999." />
        <meta name="twitter:image" content="https://vybebd.store/og-image.jpg" />
        <meta name="twitter:image:alt" content="VYBE - Premium Posters & Wall Art Bangladesh" />

        {/* Organization Schema — helps Google Knowledge Panel */}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'VYBE',
          url: 'https://vybebd.store',
          logo: 'https://vybebd.store/vybe-logo.svg',
          description: 'Premium poster and wall art store in Bangladesh. Anime, Marvel, Football, Cars, Music posters.',
          sameAs: [
            'https://www.facebook.com/profile.php?id=61580594942475',
            'https://www.instagram.com/vybe.bd/',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['Bengali', 'English'],
          },
        })}</script>

        {/* WebSite Schema — enables Google Sitelinks Search Box */}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'VYBE',
          url: 'https://vybebd.store',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://vybebd.store/products?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        })}</script>
      </Helmet>

      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-moon-midnight via-moon-space to-moon-midnight' 
          : 'bg-white'
      }`}>
        {/* Announcement Bar */}
        <AnnouncementBar />

        {/* Hero Section */}
        <HeroCarousel />

        {/* Collection Grid */}
        <CollectionGrid darkMode={darkMode} />

        {/* Featured Products */}
        <FeaturedProducts darkMode={darkMode} />

        {/* Trust Badges */}
        <TrustBadges darkMode={darkMode} />

        {/* Bundle Section */}
        <BundleSection />

        {/* Instagram Feed */}
        <InstagramFeed darkMode={darkMode} />

        {/* Newsletter */}
        <Newsletter />

        {/* Privacy Policy Notice - Required for verification */}
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We value your privacy. Read our{' '}
            <a 
              href="/privacy-policy" 
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-medium"
            >
              Privacy Policy
            </a>
            {' '}and{' '}
            <a 
              href="/terms-of-service" 
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-medium"
            >
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
