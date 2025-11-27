import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products?page=1&limit=4').then(res => {
      setFeaturedProducts(res.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse-slow"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse-slow animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-full">
              <span className="text-sm font-medium text-cyan-400">✨ Welcome to VYBE 2025</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Elevate Your<br /><span className="gradient-text">Living Space</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">Premium wall art, motivational posters, and Islamic calligraphy. Transform your space with stunning designs.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/products" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105">Shop Now</Link>
              <Link to="/products?category=football-motivational" className="px-8 py-4 glass-button rounded-lg font-medium">View Football Collection</Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {[
              { icon: Zap, title: 'Fast Delivery', desc: 'Get your orders delivered quickly' },
              { icon: Shield, title: 'Quality Prints', desc: 'Premium materials and vibrant colors' },
              { icon: TrendingUp, title: 'Trending Designs', desc: 'Latest and most popular artwork' }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured <span className="text-cyan-400">Products</span></h2>
            <p className="text-white/60">Check out our most popular items</p>
          </div>
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => <ProductCard key={product._id} product={product} />)}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/products" className="inline-block px-8 py-4 glass-button rounded-lg font-medium hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-500 transition-all">View All Products</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
