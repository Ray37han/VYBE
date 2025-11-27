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
