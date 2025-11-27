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
