/**
 * QuickCheckout – Vybe Order Pipeline Checkout
 *
 * Mobile-first, one-page checkout for Bangladesh e-commerce.
 * No login required. Posts to POST /api/pipeline/create.
 *
 * URL params accepted:
 *   ?productId=&name=&price=&qty=
 *
 * Routes on success to /order-confirmed with order data in location.state.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

/* ─── District list ───────────────────────────────────────────────────────── */
const BD_DISTRICTS = [
  'Bagerhat','Bandarban','Barguna','Barisal','Bhola','Bogura','Brahmanbaria',
  'Chandpur','Chapainawabganj','Chattogram','Chuadanga','Cumilla',"Cox's Bazar",
  'Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur','Gopalganj',
  'Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat',
  'Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia','Lakshmipur',
  'Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar',
  'Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi',
  'Natore','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh',
  'Patuakhali','Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur',
  'Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet',
  'Tangail','Thakurgaon',
];

const PAYMENT_METHODS = [
  { id: 'Cash On Delivery', label: 'Cash On Delivery',  icon: '💵' },
  { id: 'bKash',            label: 'bKash',             icon: '📱' },
  { id: 'Nagad',            label: 'Nagad',             icon: '💳' },
  { id: 'Rocket',           label: 'Rocket',            icon: '🚀' },
];

const BD_PHONE_RE = /^01[3-9]\d{8}$/;

/* ─── Helper: get API base URL ───────────────────────────────────────────── */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5001/api'
    : '/api');

/* ─── Spinner component ───────────────────────────────────────────────────── */
function Spinner() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        className="animate-spin h-5 w-5 text-white"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Processing…
    </span>
  );
}

/* ─── Field wrapper ───────────────────────────────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-200">
        {label}{required && <span className="text-purple-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

/* ─── Input styles ────────────────────────────────────────────────────────── */
const inputCls =
  'w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 ' +
  'text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 ' +
  'focus:ring-1 focus:ring-purple-400 transition text-sm';

const selectCls = inputCls + ' appearance-none';

/* ═══════════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════════ */
export default function QuickCheckout() {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();

  /* ── Auto-fill product from URL ─────── */
  const urlProductId   = params.get('productId') || '';
  const urlProductName = params.get('name')      || '';
  const urlProductImage = params.get('image')    || '';
  const urlPrice       = parseFloat(params.get('price') || '0');
  const urlQty         = parseInt(params.get('qty') || '1', 10);

  /* ── Form state ─────────────────────── */
  const [form, setForm] = useState({
    customerName:  '',
    phone:         '',
    email:         '',
    district:      '',
    address:       '',
    orderNotes:    '',
    productName:   urlProductName,
    productId:     urlProductId,
    productImageUrl: urlProductImage,
    price:         urlPrice || '',
    quantity:      urlQty || 1,
    paymentMethod: 'Cash On Delivery',
  });

  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState('');

  /* Recompute total whenever price or quantity changes */
  const total = (parseFloat(form.price) || 0) * (parseInt(form.quantity, 10) || 1);

  /* ── Handlers ───────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  /* Inline validation */
  function validate() {
    const errs = {};
    if (!form.customerName.trim())
      errs.customerName = 'Full name is required';
    if (!BD_PHONE_RE.test(form.phone.trim()))
      errs.phone = 'Enter a valid BD number: 01XXXXXXXXX';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email';
    if (!form.district)
      errs.district = 'Please select your district';
    if (!form.address.trim())
      errs.address = 'Delivery address is required';
    if (!form.productName.trim())
      errs.productName = 'Product name is required';
    if (!form.price || parseFloat(form.price) <= 0)
      errs.price = 'Price must be greater than 0';
    if (!form.quantity || parseInt(form.quantity, 10) < 1)
      errs.quantity = 'Quantity must be at least 1';
    return errs;
  }

  /* ── Submit ─────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErr = document.querySelector('[data-field-error]');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const payload = {
        customerName:  form.customerName.trim(),
        phone:         form.phone.trim(),
        email:         form.email.trim(),
        district:      form.district,
        address:       form.address.trim(),
        orderNotes:    form.orderNotes.trim(),
        productName:   form.productName.trim(),
        productId:     form.productId.trim(),
        productImageUrl: form.productImageUrl?.trim() || '',
        price:         parseFloat(form.price),
        quantity:      parseInt(form.quantity, 10),
        products: [
          {
            name: form.productName.trim(),
            quantity: parseInt(form.quantity, 10),
            price: parseFloat(form.price),
            image_url: form.productImageUrl?.trim() || '',
          },
        ],
        paymentMethod: form.paymentMethod,
        pageUrl:       window.location.href,
      };

      const res = await fetch(`${API_BASE}/pipeline/create`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg =
          data.errors?.[0]?.msg ||
          data.message ||
          'Something went wrong. Please try again.';
        setApiError(msg);
        return;
      }

      /* Success – navigate to confirmation page */
      navigate('/order-confirmed', {
        state: {
          orderId:       data.orderId,
          customerName:  form.customerName,
          productName:   form.productName,
          quantity:      parseInt(form.quantity, 10),
          total,
          paymentMethod: form.paymentMethod,
        },
        replace: true,
      });
    } catch (err) {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Render ─────────────────────────── */
  return (
    <>
      <Helmet>
        <title>Checkout – Vybe</title>
        <meta name="description" content="Complete your Vybe order" />
      </Helmet>

      {/* ── Page wrapper ─── */}
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex flex-col items-center px-4 py-10">

        {/* ── Card ─── */}
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

          {/* ── Header ─── */}
          <div className="bg-gradient-to-r from-purple-700 to-violet-600 px-6 py-5 text-center">
            <p className="text-purple-200 text-xs uppercase tracking-widest mb-1">Secure Checkout</p>
            <h1 className="text-white text-2xl font-bold tracking-tight">
              Complete Your Order
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-7 flex flex-col gap-5" noValidate>

            {/* ── Product summary banner ─── */}
            {form.productName && (
              <div className="bg-purple-900/40 border border-purple-700/50 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-purple-300 text-xs uppercase tracking-wide mb-0.5">Product</p>
                  <p className="text-white font-semibold text-sm">{form.productName}</p>
                  {form.productId && (
                    <p className="text-gray-400 text-xs mt-0.5">ID: {form.productId}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-purple-300 text-xs">Total</p>
                  <p className="text-white font-bold text-lg">৳{total.toFixed(0)}</p>
                  <p className="text-gray-400 text-xs">৳{parseFloat(form.price || 0).toFixed(0)} × {form.quantity}</p>
                </div>
              </div>
            )}

            {/* ─── Section: Customer Info ─── */}
            <div className="flex flex-col gap-4">
              <h2 className="text-purple-300 text-xs font-semibold uppercase tracking-widest border-b border-white/10 pb-2">
                Your Information
              </h2>

              <Field label="Full Name" required error={errors.customerName}>
                <input
                  type="text" name="customerName" value={form.customerName}
                  onChange={handleChange} placeholder="e.g. Rahul Ahmed"
                  className={inputCls} autoComplete="name"
                  data-field-error={errors.customerName ? '' : undefined}
                />
              </Field>

              <Field label="Phone Number" required error={errors.phone}>
                <input
                  type="tel" name="phone" value={form.phone}
                  onChange={handleChange} placeholder="01XXXXXXXXX"
                  className={inputCls} autoComplete="tel" inputMode="numeric"
                  maxLength={11}
                />
              </Field>

              <Field label="Email (optional)" error={errors.email}>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com"
                  className={inputCls} autoComplete="email"
                />
              </Field>
            </div>

            {/* ─── Section: Delivery ─── */}
            <div className="flex flex-col gap-4">
              <h2 className="text-purple-300 text-xs font-semibold uppercase tracking-widest border-b border-white/10 pb-2">
                Delivery Details
              </h2>

              <Field label="District" required error={errors.district}>
                <div className="relative">
                  <select
                    name="district" value={form.district}
                    onChange={handleChange} className={selectCls}
                  >
                    <option value="">— Select your district —</option>
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                </div>
              </Field>

              <Field label="Full Address" required error={errors.address}>
                <textarea
                  name="address" value={form.address}
                  onChange={handleChange} rows={3}
                  placeholder="House, Road, Area, Upazila…"
                  className={inputCls + ' resize-none'}
                />
              </Field>
            </div>

            {/* ─── Section: Order ─── */}
            <div className="flex flex-col gap-4">
              <h2 className="text-purple-300 text-xs font-semibold uppercase tracking-widest border-b border-white/10 pb-2">
                Order Details
              </h2>

              <Field label="Product Name" required error={errors.productName}>
                <input
                  type="text" name="productName" value={form.productName}
                  onChange={urlProductName ? undefined : handleChange}
                  readOnly={!!urlProductName}
                  placeholder="Product name"
                  className={inputCls + (urlProductName ? ' bg-gray-50 cursor-default opacity-80' : '')}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity" required error={errors.quantity}>
                  <input
                    type="number" name="quantity" value={form.quantity}
                    onChange={handleChange} min={1} max={99}
                    className={inputCls} inputMode="numeric"
                  />
                </Field>
                <Field label="Price (৳)" required error={errors.price}>
                  <input
                    type="number" name="price" value={form.price}
                    onChange={handleChange} min={0} step="0.01"
                    placeholder="0"
                    className={inputCls} inputMode="decimal"
                  />
                </Field>
              </div>

              {/* Total display */}
              <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <span className="text-gray-300 text-sm">Order Total</span>
                <span className="text-white text-xl font-bold">৳{total.toFixed(0)}</span>
              </div>
            </div>

            {/* ─── Section: Payment ─── */}
            <div className="flex flex-col gap-3">
              <h2 className="text-purple-300 text-xs font-semibold uppercase tracking-widest border-b border-white/10 pb-2">
                Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(({ id, label, icon }) => (
                  <label
                    key={id}
                    className={
                      'flex items-center gap-2 px-3 py-3 rounded-xl border cursor-pointer transition ' +
                      (form.paymentMethod === id
                        ? 'border-purple-500 bg-purple-600/30 text-white'
                        : 'border-white/15 bg-white/5 text-gray-300 hover:border-purple-400/50')
                    }
                  >
                    <input
                      type="radio" name="paymentMethod" value={id}
                      checked={form.paymentMethod === id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ─── Order notes ─── */}
            <Field label="Order Notes (optional)">
              <textarea
                name="orderNotes" value={form.orderNotes}
                onChange={handleChange} rows={2}
                placeholder="Any special instructions, size, color, etc."
                className={inputCls + ' resize-none'}
              />
            </Field>

            {/* ─── API error ─── */}
            {apiError && (
              <div className="bg-red-900/40 border border-red-500/50 rounded-xl px-4 py-3 text-red-300 text-sm">
                {apiError}
              </div>
            )}

            {/* ─── Submit button ─── */}
            <button
              type="submit"
              disabled={loading}
              className={
                'w-full py-4 rounded-xl font-bold text-white text-base transition-all ' +
                (loading
                  ? 'bg-purple-700/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 active:scale-[.98] shadow-lg shadow-purple-900/50')
              }
            >
              {loading ? <Spinner /> : '🛒 Place Order'}
            </button>

            <p className="text-center text-gray-500 text-xs">
              🔒 Your information is secure. We will call you to confirm.
            </p>
          </form>
        </div>

        {/* ── Footer ─── */}
        <p className="mt-6 text-gray-600 text-xs">© {new Date().getFullYear()} Vybe – vybebd.store</p>
      </div>
    </>
  );
}
