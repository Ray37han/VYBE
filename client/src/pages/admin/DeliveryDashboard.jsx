/**
 * DeliveryDashboard – Admin Order Pipeline Manager
 *
 * Route: /admin/delivery
 * Access: Admin only (guarded by ProtectedRoute in App.jsx)
 *
 * Features:
 *  - All pipeline orders table
 *  - Filter by status, search by phone / OrderID
 *  - Status update modal (Confirm / Processing / Shipped / Delivered / Cancel)
 *  - Assign courier modal → calls backend → gets tracking ID
 *  - Real-time counter badges per status
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ─── Constants ───────────────────────────────────────────────────────────── */
const STATUSES = ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];
const COURIERS = ['Pathao','Steadfast','RedX'];

const STATUS_META = {
  Pending:    { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',  dot: 'bg-yellow-400' },
  Confirmed:  { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',        dot: 'bg-blue-400'   },
  Processing: { color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',  dot: 'bg-indigo-400' },
  Shipped:    { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',  dot: 'bg-purple-400' },
  Delivered:  { color: 'bg-green-500/20 text-green-300 border-green-500/30',     dot: 'bg-green-400'  },
  Cancelled:  { color: 'bg-red-500/20 text-red-300 border-red-500/30',           dot: 'bg-red-400'    },
};

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5001/api'
    : '/api');

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function authHeader() {
  const token =
    document.cookie.match(/token=([^;]+)/)?.[1] ||
    localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {status}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════════ */
export default function DeliveryDashboard() {
  const [orders,       setOrders]       = useState([]);
  const [pagination,   setPagination]   = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,         setPage]         = useState(1);

  // Modals
  const [statusModal,  setStatusModal]  = useState(null); // { order }
  const [courierModal, setCourierModal] = useState(null); // { order }

  // Modal form state
  const [newStatus,    setNewStatus]    = useState('');
  const [adminNote,    setAdminNote]    = useState('');
  const [selectedCourier, setSelectedCourier] = useState('Steadfast');
  const [actionLoading,   setActionLoading]   = useState(false);

  /* ── Fetch orders ─────────── */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) {
        if (/^VYBE-/i.test(search.trim())) params.set('orderId', search.trim());
        else params.set('phone', search.trim());
      }

      const data = await apiFetch(`/pipeline/orders?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch (err) {
      toast.error(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* ── Status counters (derived) ─── */
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  /* ── Update status ─────────── */
  async function handleStatusUpdate() {
    if (!newStatus) { toast.error('Select a status'); return; }
    setActionLoading(true);
    try {
      await apiFetch(`/pipeline/orders/${statusModal.order.orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      toast.success(`Order status → ${newStatus}`);
      setStatusModal(null);
      setNewStatus('');
      setAdminNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  /* ── Assign courier ─────────── */
  async function handleAssignCourier() {
    setActionLoading(true);
    try {
      const data = await apiFetch(`/pipeline/orders/${courierModal.order.orderId}/courier`, {
        method: 'POST',
        body: JSON.stringify({ courier: selectedCourier }),
      });
      toast.success(`Assigned to ${selectedCourier}. Tracking: ${data.trackingId || 'pending'}`);
      setCourierModal(null);
      fetchOrders();
    } catch (err) {
      toast.error(`Courier error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  /* ── Quick status shortcut ─────────── */
  async function quickStatus(order, status) {
    try {
      await apiFetch(`/pipeline/orders/${order.orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`${order.orderId} → ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    }
  }

  /* ── Render ─────────────────── */
  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">

      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Dashboard</h1>
          <p className="text-gray-400 text-sm">Pipeline orders · {pagination.total} total</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin" className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition">
            ← Admin
          </Link>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm hover:bg-purple-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-5">

        {/* ── Status filter tabs ── */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
              !statusFilter
                ? 'bg-purple-700 border-purple-600 text-white'
                : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            All ({pagination.total})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
                statusFilter === s
                  ? 'bg-purple-700 border-purple-600 text-white'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {s}
              {counts[s] ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="flex gap-2">
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by phone or Order ID (VYBE-…)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-gray-500 text-sm animate-pulse">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-gray-500 text-sm">No orders found.</div>
          ) : (
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                  {['Order ID','Customer','Phone','Product','District','Payment','Status','Courier','Tracking','Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/3 transition">
                    <td className="px-4 py-3 font-mono text-purple-300 text-xs whitespace-nowrap">{order.orderId}</td>
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{order.customerName}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{order.phone}</td>
                    <td className="px-4 py-3 text-gray-300 max-w-[140px] truncate" title={order.productName}>{order.productName}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{order.district}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-gray-300">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{order.courier || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.trackingId || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {/* Quick confirm */}
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => quickStatus(order, 'Confirmed')}
                            className="px-2 py-1 rounded-lg bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs hover:bg-blue-600/50 transition whitespace-nowrap"
                          >
                            ✓ Confirm
                          </button>
                        )}
                        {/* Status modal */}
                        <button
                          onClick={() => { setStatusModal({ order }); setNewStatus(order.status); }}
                          className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-gray-300 text-xs hover:bg-white/15 transition whitespace-nowrap"
                        >
                          Status
                        </button>
                        {/* Courier modal */}
                        {!order.courier && order.status !== 'Cancelled' && (
                          <button
                            onClick={() => setCourierModal({ order })}
                            className="px-2 py-1 rounded-lg bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-600/50 transition whitespace-nowrap"
                          >
                            🚚 Courier
                          </button>
                        )}
                        {/* Cancel */}
                        {!['Delivered','Cancelled'].includes(order.status) && (
                          <button
                            onClick={() => quickStatus(order, 'Cancelled')}
                            className="px-2 py-1 rounded-lg bg-red-600/20 border border-red-500/20 text-red-400 text-xs hover:bg-red-600/30 transition whitespace-nowrap"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm transition ${
                  p === page
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* ═══ Status Update Modal ═══ */}
      {statusModal && (
        <Modal title={`Update Status – ${statusModal.order.orderId}`} onClose={() => setStatusModal(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map((s) => (
                  <label
                    key={s}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition ${
                      newStatus === s
                        ? 'border-purple-500 bg-purple-800/30 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-purple-400/40'
                    }`}
                  >
                    <input
                      type="radio" name="newStatus" value={s}
                      checked={newStatus === s}
                      onChange={() => setNewStatus(s)}
                      className="sr-only"
                    />
                    <span className={`w-2 h-2 rounded-full ${STATUS_META[s]?.dot || 'bg-gray-500'}`} />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Admin Note (optional)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Internal note…"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm transition"
            >
              {actionLoading ? 'Updating…' : 'Update Status'}
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ Assign Courier Modal ═══ */}
      {courierModal && (
        <Modal title={`Assign Courier – ${courierModal.order.orderId}`} onClose={() => setCourierModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-gray-300">
              <p><span className="text-gray-500">Customer:</span> {courierModal.order.customerName}</p>
              <p><span className="text-gray-500">Address:</span> {courierModal.order.address}</p>
              <p><span className="text-gray-500">District:</span> {courierModal.order.district}</p>
              <p><span className="text-gray-500">COD Amount:</span> {courierModal.order.paymentMethod === 'Cash On Delivery' ? `৳${courierModal.order.total}` : '0 (Prepaid)'}</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Select Courier</label>
              <div className="flex gap-2">
                {COURIERS.map((c) => (
                  <label
                    key={c}
                    className={`flex-1 text-center px-3 py-2.5 rounded-xl border cursor-pointer transition ${
                      selectedCourier === c
                        ? 'border-purple-500 bg-purple-800/30 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-purple-400/40'
                    }`}
                  >
                    <input
                      type="radio" name="courier" value={c}
                      checked={selectedCourier === c}
                      onChange={() => setSelectedCourier(c)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/30 rounded-xl px-3 py-2 text-yellow-300 text-xs">
              ⚠️ This will call the {selectedCourier} API and create a delivery order. Status will be set to Shipped.
            </div>

            <button
              onClick={handleAssignCourier}
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm transition"
            >
              {actionLoading ? 'Dispatching…' : `Dispatch via ${selectedCourier}`}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
