import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.register(formData);
      login(data.data, data.token);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gradient-to-br dark:from-moon-night dark:via-moon-midnight dark:to-moon-night">
      <div className="card max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-2 dark:text-moon-silver">Create Account</h1>
        <p className="text-gray-600 dark:text-moon-silver/70 text-center mb-8">Join VYBE today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
              placeholder="+880 1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40 dark:focus:border-moon-gold dark:focus:ring-moon-gold/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 dark:text-moon-silver/70">
          Already have an account?{' '}
          <Link to="/login" className="text-vybe-purple dark:text-moon-gold font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
