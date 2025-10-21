import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCreative } from 'swiper/modules';
import { FiShoppingCart, FiStar, FiTruck, FiAward } from 'react-icons/fi';
import { productsAPI } from '../api';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productsAPI.getAll({ featured: true, limit: 8 });
        setFeaturedProducts(response.data || response || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Elevate Your Space with{' '}
                <span className="gradient-text">Personalized Artistry</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Browse our collection of customized and designer posters, meticulously 
                crafted to reflect your unique style. Transform your walls into captivating canvases.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary">
                  Explore Collections
                </Link>
                <Link to="/products?category=custom" className="btn-secondary">
                  Customize Now
                </Link>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] hidden md:block"
            >
              <div className="absolute top-0 right-0 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 animate-float">
                <img 
                  src="https://res.cloudinary.com/dyonj35w3/image/upload/v1761062355/vybe-products/vt2iqtsyylgwyfslyktf.jpg" 
                  alt="Cristiano Ronaldo CR7"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-20 left-0 w-56 h-72 rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '2s' }}>
                <img 
                  src="https://res.cloudinary.com/dyonj35w3/image/upload/v1761062285/vybe-products/q4tatclc8xeuqlxunxav.jpg" 
                  alt="Cristiano Ronaldo Madrid"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-10 right-20 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '4s' }}>
                <img 
                  src="https://res.cloudinary.com/dyonj35w3/image/upload/v1761035347/vybe-products/jfnu9vrkmxl6p4kcsusa.jpg" 
                  alt="Cristiano Ronaldo"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-vybe-purple rounded-full flex justify-center">
            <div className="w-1 h-3 bg-vybe-purple rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-8 card hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-vybe-purple to-vybe-pink rounded-full flex items-center justify-center">
                <FiShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Designs</h3>
              <p className="text-gray-600">
                Create unique artwork tailored to your vision and space requirements
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-8 card hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-vybe-purple to-vybe-pink rounded-full flex items-center justify-center">
                <FiTruck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick turnaround with secure packaging and reliable shipping across Bangladesh
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center p-8 card hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-vybe-purple to-vybe-pink rounded-full flex items-center justify-center">
                <FiAward className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                High-resolution prints on premium materials for lasting beauty
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products - Swiper Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Featured Collections</h2>
            <p className="section-subtitle">Discover our curated selection of stunning wall art</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-vybe-purple"></div>
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination, EffectCreative]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="pb-12"
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link to={`/products/${product._id}`} className="block group">
                    <div className="card overflow-hidden">
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                        <img
                          src={product.images[0]?.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23f0f0f0" width="400" height="500"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-4 text-white w-full">
                            <button className="w-full btn-primary">View Details</button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-vybe-purple">
                            ৳{product.basePrice}
                          </span>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{product.rating.average.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <div className="text-center mt-8">
            <Link to="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-vybe-purple to-vybe-pink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start creating your personalized poster today and bring your vision to life
            </p>
            <Link to="/products?category=custom" className="bg-white text-vybe-purple px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all inline-block">
              Start Customizing
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
