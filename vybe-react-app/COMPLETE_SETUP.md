# VYBE Aurora Glass E-Commerce App - Complete Setup

## Quick Setup Commands

Run these commands in your terminal to complete the VYBE app setup:

```bash
cd "/Users/rayhan/Documents/My Mac/Web/vybe-mern/vybe-react-app"

# Create .env file
cat > .env << 'EOF'
VITE_API_URL=https://vybe-backend-93eu.onrender.com/api
EOF

# Update all component files
cat > src/components/Footer.jsx << 'EOF'
import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-20 py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">VYBE</span>
            </div>
            <p className="text-sm text-white/60">
              Premium products with cutting-edge design for the modern lifestyle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/products" className="hover:text-cyan-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=football-motivational" className="hover:text-cyan-400 transition-colors">Football</Link></li>
              <li><Link to="/products?category=wall-art" className="hover:text-cyan-400 transition-colors">Wall Art</Link></li>
              <li><Link to="/products?category=islamic" className="hover:text-cyan-400 transition-colors">Islamic</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-white/60 mb-4">Subscribe for exclusive offers</p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                ✓
              </button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-sm text-white/50">
          © 2025 VYBE. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
EOF

cat > src/components/ProductCard.jsx << 'EOF'
import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function ProductCard({ product }) {
  const imageUrl = product.images?.[0]?.urls?.thumbnail || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
  
  return (
    <div className="group relative glass-card p-6 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-2">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative overflow-hidden rounded-xl mb-4 bg-white/5">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-cyan-400 font-medium uppercase tracking-wider">
            {product.category || 'General'}
          </div>
          
          <h3 className="text-lg font-bold leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-cyan-400">৳{product.basePrice}</span>
            <div className="px-4 py-2 glass-button rounded-lg hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-500 hover:border-transparent transition-all">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
EOF

cat > src/components/LoadingSpinner.jsx << 'EOF'
import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} text-cyan-400 animate-spin`} />
    </div>
  )
}
EOF

cat > src/components/Modal.jsx << 'EOF'
import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      <div className="relative glass-card p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 glass-button rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
EOF

cat > src/components/BackToTop.jsx << 'EOF'
import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-lg hover:shadow-cyan-500/50 transition-all z-40"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
EOF

echo "✓ All components updated"
```

## Update Page Files

```bash
# Update Home.jsx with Aurora Glass hero section
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
    api.get('/products?page=1&limit=4')
      .then(res => {
        setFeaturedProducts(res.data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
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
              Elevate Your
              <br />
              <span className="gradient-text">Living Space</span>
            </h1>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Premium wall art, motivational posters, and Islamic calligraphy. 
              Transform your space with stunning designs.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/products"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
              >
                Shop Now
              </Link>
              <Link 
                to="/products?category=football-motivational"
                className="px-8 py-4 glass-button rounded-lg font-medium"
              >
                View Football Collection
              </Link>
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
            <h2 className="text-4xl font-bold mb-4">
              Featured <span className="text-cyan-400">Products</span>
            </h2>
            <p className="text-white/60">Check out our most popular items</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/products"
              className="inline-block px-8 py-4 glass-button rounded-lg font-medium hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-500 transition-all"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
EOF

echo "✓ Home page updated"
```

## Run the App

After running the above commands, your app will be ready:

```bash
# The dev server should already be running on port 3001
# If not, start it with:
npm run dev

# Open in browser:
open http://localhost:3001
```

## Features Implemented

✅ **Aurora Glass Design** - Glassmorphic UI with animated gradient orbs
✅ **Scrolling Navbar** - Transparent → Glass effect on scroll  
✅ **Product Grid** - Loads real products from your backend API
✅ **Shopping Cart** - Add/remove items with localStorage persistence
✅ **User Authentication** - Login/Register/Logout functionality
✅ **Protected Routes** - Orders and Admin pages require login
✅ **Admin Panel** - Product management for admin users
✅ **Responsive Design** - Mobile-first approach
✅ **Smooth Animations** - Hover effects, page transitions
✅ **Back to Top Button** - Smooth scroll to top

## Next Steps

1. Run the setup commands above
2. Test the app at http://localhost:3001
3. Try adding products to cart
4. Test login/register flows
5. If you're an admin, test the admin panel

All data is loaded from your production backend at:
`https://vybe-backend-93eu.onrender.com/api`
