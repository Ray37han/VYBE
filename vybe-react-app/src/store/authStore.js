import { create } from 'zustand'
import api from '../api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  
  async login(credentials) {
    try {
      const { data } = await api.post('/auth/login', credentials)
      localStorage.setItem('vybe_token', data.token)
      await this.fetchUser()
      return data
    } catch (error) {
      throw error
    }
  },
  
  async register(userData) {
    try {
      const { data } = await api.post('/auth/register', userData)
      return data
    } catch (error) {
      throw error
    }
  },
  
  async fetchUser() {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user })
    } catch (error) {
      set({ user: null })
      localStorage.removeItem('vybe_token')
    }
  },
  
  logout() {
    set({ user: null })
    localStorage.removeItem('vybe_token')
  }
}))
