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
