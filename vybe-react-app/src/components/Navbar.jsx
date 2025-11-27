import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Menu, X, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const items = useCartStore(s => s.items)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-b border-white/20 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">VYBE</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-cyan-400 transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium hover:text-cyan-400 transition-colors">Shop</Link>
            {user && <Link to="/my-orders" className="text-sm font-medium hover:text-cyan-400 transition-colors">Orders</Link>}
            {user?.role === 'admin' && <Link to="/admin/products" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">Admin</Link>}
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 glass-button rounded-lg">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <button onClick={logout} className="hidden md:block px-4 py-2 glass-button rounded-lg text-sm font-medium">
                Logout
              </button>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 glass-button rounded-lg text-sm font-medium">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all">Register</Link>
              </div>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 glass-button rounded-lg">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 backdrop-blur-xl bg-white/5 rounded-b-lg border-t border-white/10">
            <Link to="/" className="block px-4 py-2 text-sm hover:bg-white/10 rounded transition-colors">Home</Link>
            <Link to="/products" className="block px-4 py-2 text-sm hover:bg-white/10 rounded transition-colors">Shop</Link>
            {user && <Link to="/my-orders" className="block px-4 py-2 text-sm hover:bg-white/10 rounded transition-colors">Orders</Link>}
            {user?.role === 'admin' && <Link to="/admin/products" className="block px-4 py-2 text-sm text-purple-400 hover:bg-white/10 rounded transition-colors">Admin</Link>}
            <div className="border-t border-white/10 pt-2">
              {user ? (
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 rounded transition-colors">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 text-sm hover:bg-white/10 rounded transition-colors">Login</Link>
                  <Link to="/register" className="block px-4 py-2 text-sm text-cyan-400 hover:bg-white/10 rounded transition-colors">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
