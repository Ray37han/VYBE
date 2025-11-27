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
            <p className="text-sm text-white/60">Premium products for modern lifestyle.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/products" className="hover:text-cyan-400 transition-colors">All Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <input type="email" placeholder="Your email" className="w-full px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-sm" />
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-sm text-white/50">© 2025 VYBE. All rights reserved.</div>
      </div>
    </footer>
  )
}
