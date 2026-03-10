import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar.optimized'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import VybePageTransitions from './components/VybePageTransitions'
import CheckoutSkeleton from './components/CheckoutSkeleton'
import './components/PageTransitions.css'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Customize from './pages/Customize'
import Cart from './pages/Cart'
import MyOrders from './pages/MyOrders'
import Account from './pages/Account'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'

// Lazy load checkout flow for better performance
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
// Admin components - all lowercase 'admin' folder
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import AdminFeaturedPosters from './pages/admin/FeaturedPosters'
import AdminHeroItems from './pages/admin/HeroItems'
import AdminCustomOrders from './pages/admin/AdminCustomOrders'
import AdminCustomApprovals from './pages/admin/CustomApprovals'
import AdminBulkImport from './pages/admin/BulkImport'
import AdminAnalytics from './pages/admin/Analytics'
import ProtectedRoute from './components/ProtectedRoute'
import { AnalyticsProvider } from './context/AnalyticsContext'

function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <AnalyticsProvider>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <VybePageTransitions location={location}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Protected Routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Suspense fallback={<CheckoutSkeleton />}>
                  <Checkout />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute>
                <Suspense fallback={<CheckoutSkeleton />}>
                  <OrderSuccess />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute adminOnly>
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/featured-posters" element={
              <ProtectedRoute adminOnly>
                <AdminFeaturedPosters />
              </ProtectedRoute>
            } />
            <Route path="/admin/hero-items" element={
              <ProtectedRoute adminOnly>
                <AdminHeroItems />
              </ProtectedRoute>
            } />
            <Route path="/admin/custom-orders" element={
              <ProtectedRoute adminOnly>
                <AdminCustomOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/custom-approvals" element={
              <ProtectedRoute adminOnly>
                <AdminCustomApprovals />
              </ProtectedRoute>
            } />
            <Route path="/admin/bulk-import" element={
              <ProtectedRoute adminOnly>
                <AdminBulkImport />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute adminOnly>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
          </Routes>
        </VybePageTransitions>
      </main>
      <Footer />
      <BackToTop />
    </div>
    </AnalyticsProvider>
  )
}

export default App
