/**
 * OrderConfirmed – Pipeline Order Success Page
 *
 * Shown after a successful POST /api/pipeline/create.
 * Receives order details from React Router location.state.
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

/* Simple confetti burst using canvas */
function burstConfetti(canvas) {
  const ctx    = canvas.getContext('2d');
  const W      = (canvas.width  = window.innerWidth);
  const H      = (canvas.height = window.innerHeight);
  const colors = ['#7c3aed','#a78bfa','#c4b5fd','#ddd6fe','#ffffff','#fbbf24'];
  const pieces = Array.from({ length: 120 }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H - H,
    r:  Math.random() * 6 + 3,
    d:  Math.random() * 8 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltAngleInc: Math.random() * 0.1 + 0.04,
  }));

  let frame;
  let tick = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach((p) => {
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();

      p.tiltAngle += p.tiltAngleInc;
      p.y += (Math.cos(p.d) + 1 + p.r / 2) * 1.5;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      if (p.y > H) {
        p.x  = Math.random() * W;
        p.y  = -10;
        p.r  = Math.random() * 6 + 3;
        p.d  = Math.random() * 8 + 2;
      }
    });

    tick++;
    if (tick < 200) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, W, H);
  }

  draw();
  return () => cancelAnimationFrame(frame);
}

export default function OrderConfirmed() {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const state = location.state;

  /* Redirect if accessed directly with no state */
  useEffect(() => {
    if (!state?.orderId) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  /* Confetti on mount */
  useEffect(() => {
    if (!canvasRef.current || !state?.orderId) return;
    const cleanup = burstConfetti(canvasRef.current);
    return cleanup;
  }, [state]);

  if (!state?.orderId) return null;

  const {
    orderId,
    customerName,
    productName,
    quantity,
    total,
    paymentMethod,
  } = state;

  return (
    <>
      <Helmet>
        <title>Order Confirmed – Vybe</title>
      </Helmet>

      {/* Canvas for confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        aria-hidden="true"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex flex-col items-center justify-center px-4 py-12">

        {/* ── Card ─── */}
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-center">

          {/* ── Success header ─── */}
          <div className="bg-gradient-to-r from-purple-700 to-violet-600 px-6 py-8">
            {/* Checkmark circle – pure CSS, no external library needed */}
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 52 52" className="w-12 h-12" fill="none">
                <circle cx="26" cy="26" r="25" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.15)" />
                <path
                  d="M14 27l8 8 16-16"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[dash_0.5s_ease-in-out_forwards]"
                />
              </svg>
            </div>
            <h1 className="text-white text-2xl font-bold">Order Confirmed 🎉</h1>
            <p className="text-purple-200 text-sm mt-1">
              Thank you, {customerName}!
            </p>
          </div>

          {/* ── Order details ─── */}
          <div className="px-6 py-6 flex flex-col gap-4">

            {/* Order ID chip */}
            <div className="bg-purple-900/40 border border-purple-700/50 rounded-xl px-4 py-3">
              <p className="text-purple-300 text-xs uppercase tracking-widest mb-1">Your Order ID</p>
              <p className="text-white font-mono font-bold text-lg tracking-wider">{orderId}</p>
            </div>

            {/* Details table */}
            <div className="flex flex-col gap-2 text-sm text-left">
              <Row label="Product"  value={productName} />
              <Row label="Quantity" value={quantity} />
              <Row label="Total"    value={`৳${parseFloat(total).toFixed(0)}`} highlight />
              <Row label="Payment"  value={paymentMethod} />
            </div>

            {/* Notice */}
            <div className="bg-blue-900/30 border border-blue-700/40 rounded-xl px-4 py-3 text-blue-200 text-sm text-left">
              📞 Our team will contact you shortly on the number you provided to confirm your order.
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-1">
              <Link
                to="/"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition text-center"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => navigator.clipboard?.writeText(orderId)}
                className="w-full py-3 rounded-xl border border-white/15 text-gray-300 text-sm hover:bg-white/5 transition"
              >
                Copy Order ID
              </button>
            </div>

          </div>
        </div>

        <p className="mt-6 text-gray-600 text-xs">© {new Date().getFullYear()} Vybe – vybebd.store</p>
      </div>
    </>
  );
}

/* ── Row helper ─── */
function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className={highlight ? 'text-white font-bold text-base' : 'text-gray-200 font-medium'}>
        {value}
      </span>
    </div>
  );
}
