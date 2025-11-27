#!/bin/bash

# Cart.jsx
cat > src/pages/Cart.jsx << 'EOF'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export default function Cart() {
  const { items, removeItem, updateQuantity, clear } = useCartStore()
  const navigate = useNavigate()
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping <span className="gradient-text">Cart</span></h1>

        {items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/60 mb-6">Your cart is empty</p>
            <Link to="/products" className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex gap-6">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-2">Size: {item.size}</p>
                    <p className="text-cyan-400 font-bold">৳{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(index)} className="p-2 glass-button rounded-lg hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateQuantity(index, -1)} className="p-1 glass-button rounded"><Minus className="w-4 h-4" /></button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className="p-1 glass-button rounded"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="glass-card p-6 space-y-4">
              <div className="flex justify-between text-lg">
                <span>Total:</span>
                <span className="text-2xl font-bold text-cyan-400">৳{total.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <button onClick={clear} className="flex-1 py-3 glass-button rounded-lg font-medium">Clear Cart</button>
                <Link to="/checkout" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium text-center">Checkout</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
EOF

# Checkout.jsx
cat > src/pages/Checkout.jsx << 'EOF'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import api from '../api'

export default function Checkout() {
  const { items, clear } = useCartStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', address: '', paymentMethod: 'cod' })
  const [loading, setLoading] = useState(false)
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/orders', {
        items: items.map(i => ({ product: i.productId, size: i.size, quantity: i.quantity })),
        shippingAddress: { name: form.name, phone: form.phone, address: form.address },
        paymentMethod: form.paymentMethod
      })
      clear()
      alert('Order placed successfully!')
      navigate('/my-orders')
    } catch (err) {
      alert('Failed to place order: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Delivery Address</label>
            <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Payment Method</label>
            <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
              <option value="cod">Cash on Delivery</option>
              <option value="bkash">bKash</option>
            </select>
          </div>
          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between mb-4">
              <span className="text-lg">Total:</span>
              <span className="text-2xl font-bold text-cyan-400">৳{total.toFixed(2)}</span>
            </div>
            <button type="submit" disabled={loading || items.length === 0} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50">
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
EOF

# Login.jsx
cat > src/pages/Login.jsx << 'EOF'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome <span className="gradient-text">Back</span></h1>
          <p className="text-white/60">Login to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-sm text-white/60">
            Don't have an account? <Link to="/register" className="text-cyan-400 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
EOF

# Register.jsx
cat > src/pages/Register.jsx << 'EOF'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      alert('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Create <span className="gradient-text">Account</span></h1>
          <p className="text-white/60">Join VYBE today</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          <p className="text-center text-sm text-white/60">
            Already have an account? <Link to="/login" className="text-cyan-400 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
EOF

# MyOrders.jsx
cat > src/pages/MyOrders.jsx << 'EOF'
import React, { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import api from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then(res => {
      setOrders(res.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My <span className="gradient-text">Orders</span></h1>

        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/60">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-white/60">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-white/60">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{item.product?.name || 'Product'}</span> x {item.quantity}
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-white/60">Total:</span>
                  <span className="font-bold text-cyan-400">৳{order.totalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
EOF

# AdminProducts.jsx
cat > src/pages/AdminProducts.jsx << 'EOF'
import React, { useState, useEffect } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import api from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    api.get('/admin/products').then(res => {
      setProducts(res.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const startEdit = (product) => {
    setEditing(product._id)
    setEditData({ category: product.category, name: product.name, basePrice: product.basePrice })
  }

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/products/${id}`, { productData: editData })
      setProducts(products.map(p => p._id === id ? {...p, ...editData} : p))
      setEditing(null)
      alert('Product updated!')
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin <span className="gradient-text">Products</span></h1>

        {loading ? <LoadingSpinner /> : (
          <div className="glass-card overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className="border-b border-white/5">
                    <td className="px-4 py-3">
                      {editing === product._id ? (
                        <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="px-2 py-1 glass-card text-sm" />
                      ) : product.name}
                    </td>
                    <td className="px-4 py-3">
                      {editing === product._id ? (
                        <input value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})} className="px-2 py-1 glass-card text-sm" />
                      ) : product.category}
                    </td>
                    <td className="px-4 py-3">
                      {editing === product._id ? (
                        <input type="number" value={editData.basePrice} onChange={e => setEditData({...editData, basePrice: e.target.value})} className="px-2 py-1 glass-card text-sm w-24" />
                      ) : `৳${product.basePrice}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editing === product._id ? (
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => saveEdit(product._id)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditing(null)} className="p-2 glass-button rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(product)} className="p-2 glass-button rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
EOF

# Update App.jsx
cat > src/App.jsx << 'EOF'
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import MyOrders from './pages/MyOrders'
import AdminProducts from './pages/AdminProducts'

export default function App() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
EOF

echo "✅ All remaining pages updated successfully!"
echo "✅ VYBE Aurora Glass app is complete!"
echo ""
echo "🚀 Your app is ready at: http://localhost:3001"
echo ""

