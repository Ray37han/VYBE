#!/bin/bash

# Home.jsx - Aurora Glass hero
cat > src/pages/Home.jsx << 'EOF'
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
EOF

# Products.jsx - Product grid with filters
cat > src/pages/Products.jsx << 'EOF'
import React, { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'football-motivational', 'wall-art', 'islamic', 'sports', 'cars']

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 12 })
    if (selectedCategory !== 'all') params.append('category', selectedCategory)
    if (searchQuery) params.append('search', searchQuery)
    
    api.get(`/products?${params}`).then(res => {
      setProducts(res.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, selectedCategory, searchQuery])

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our <span className="gradient-text">Products</span></h1>
          <p className="text-white/60">Browse our complete collection</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 glass-card text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === cat ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/50' : 'glass-button'}`}>
                {cat === 'all' ? 'All' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? <LoadingSpinner /> : products.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <p className="text-white/60">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map(product => <ProductCard key={product._id} product={product} />)}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-6 py-2 glass-button rounded-lg disabled:opacity-50">Previous</button>
              <span className="px-6 py-2 glass-card rounded-lg">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={products.length < 12} className="px-6 py-2 glass-button rounded-lg disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
EOF

# ProductDetail.jsx - Single product with add to cart
cat > src/pages/ProductDetail.jsx << 'EOF'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import api from '../api'
import { useCartStore } from '../store/cartStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    api.get(`/products/${id}`).then(res => {
      setProduct(res.data.data)
      if (res.data.data?.sizes?.length > 0) setSelectedSize(res.data.data.sizes[0].name)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    if (product.sizes?.length > 0 && !selectedSize) return alert('Please select a size')
    
    const size = product.sizes?.find(s => s.name === selectedSize)
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.urls?.thumbnail || product.images?.[0]?.url,
      size: selectedSize || 'default',
      price: size?.price || product.basePrice,
      quantity: 1
    })
    alert('Added to cart!')
    navigate('/cart')
  }

  if (loading) return <div className="pt-24"><LoadingSpinner /></div>
  if (!product) return <div className="pt-24 text-center">Product not found</div>

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center space-x-2 glass-button px-4 py-2 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="glass-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src={product.images?.[0]?.urls?.large || product.images?.[0]?.url} alt={product.name} className="w-full h-auto rounded-xl" />
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-xs text-cyan-400 font-medium uppercase mb-2">{product.category}</div>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                <p className="text-white/70">{product.description}</p>
              </div>

              <div className="text-3xl font-bold text-cyan-400">৳{selectedSize ? product.sizes?.find(s => s.name === selectedSize)?.price : product.basePrice}</div>

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3">Select Size:</label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(size => (
                      <button key={size.name} onClick={() => setSelectedSize(size.name)} className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedSize === size.name ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'glass-button'}`}>
                        {size.name} - ৳{size.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleAddToCart} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

echo "✅ Pages 1-3 updated (Home, Products, ProductDetail)"

