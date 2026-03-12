import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense, Component } from 'react'
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
import NotFound from './pages/NotFound'

// Lazy load checkout flow for better performance
const Checkout = lazy(() => import('./pages/QuickCheckout'))
const OrderSuccess = lazy(() => import('./pages/OrderConfirmed'))
// Admin components - all lowercase 'admin' folder
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminUsers from './pages/admin/Users'
import AdminFeaturedPosters from './pages/admin/FeaturedPosters'
import AdminHeroItems from './pages/admin/HeroItems'
import AdminCustomOrders from './pages/admin/AdminCustomOrders'
import AdminCustomApprovals from './pages/admin/CustomApprovals'
import AdminBulkImport from './pages/admin/BulkImport'
import AdminAnalytics from './pages/admin/Analytics'
import DeliveryDashboard from './pages/admin/DeliveryDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AnalyticsProvider } from './context/AnalyticsContext'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      const clearCartAndReload = () => {
        try { localStorage.removeItem('cart-storage'); } catch(e) {}
        window.location.href = '/';
      };
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>Please refresh the page or clear your cart to continue.</p>
          <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>{this.state.error?.message}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/" style={{ padding: '0.75rem 1.5rem', background: '#7c3aed', color: 'white', borderRadius: '0.75rem', textDecoration: 'none' }}>Go to Home</a>
            <button onClick={clearCartAndReload} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>Clear Cart &amp; Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <ErrorBoundary>
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
            {/* Checkout – no auth required, pipeline-based */}
            <Route path="/checkout" element={
              <Suspense fallback={<CheckoutSkeleton />}>
                <Checkout />
              </Suspense>
            } />
            <Route path="/quick-checkout" element={
              <Suspense fallback={<CheckoutSkeleton />}>
                <Checkout />
              </Suspense>
            } />
            <Route path="/order-success" element={
              <Suspense fallback={<CheckoutSkeleton />}>
                <OrderSuccess />
              </Suspense>
            } />
            <Route path="/order-confirmed" element={
              <Suspense fallback={<CheckoutSkeleton />}>
                <OrderSuccess />
              </Suspense>
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
                <DeliveryDashboard />
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
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </VybePageTransitions>
      </main>
      <Footer />
      <BackToTop />
    </div>
    </AnalyticsProvider>
    </ErrorBoundary>
  )
}

export default App
