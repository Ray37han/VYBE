/**
 * Admin Analytics Dashboard
 *
 * Real-time visitor tracking + full analytics via Recharts.
 * Pulls data from /api/analytics/* endpoints.
 * Uses Socket.IO for live active visitor count.
 */

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/index';

// ─── Constants ─────────────────────────────────────────────────────────────────
const FALLBACK_API_URL = 'https://vybe-backend-93eu.onrender.com/api';

function resolveApiBase() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // If env is missing or relative (e.g. /api), force known backend URL.
  if (!envUrl || envUrl.startsWith('/')) return FALLBACK_API_URL;

  // If env accidentally points to the frontend domain, force backend URL.
  if (envUrl.includes('vybebd.store')) return FALLBACK_API_URL;

  return envUrl;
}

const RAW_API_URL = resolveApiBase();
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || '').trim() || RAW_API_URL.replace(/\/api$/, '');
const DEVICE_COLORS = { mobile: '#6366f1', desktop: '#22d3ee', tablet: '#f59e0b', unknown: '#6b7280' };
const CHART_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(n) {
  return `৳${Number(n || 0).toLocaleString('en-BD')}`;
}
function formatDuration(seconds) {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

async function fetchJSON(path) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${RAW_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'indigo', icon }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan:   'bg-cyan-500/10   text-cyan-400   border-cyan-500/20',
    amber:  'bg-amber-500/10  text-amber-400  border-amber-500/20',
    green:  'bg-green-500/10  text-green-400  border-green-500/20',
    red:    'bg-red-500/10    text-red-400    border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm opacity-80">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {sub && <div className="text-xs opacity-60">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">{children}</h2>;
}

function LoadingRow({ cols = 4 }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const { user } = useAuthStore();

  const [activeCount, setActiveCount]   = useState(0);
  const [visitors, setVisitors]         = useState(null);
  const [devices, setDevices]           = useState(null);
  const [geo, setGeo]                   = useState(null);
  const [products, setProducts]         = useState(null);
  const [sales, setSales]               = useState(null);
  const [pages, setPages]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [socketStatus, setSocketStatus] = useState('connecting');

  const socketRef = useRef(null);

  // ── Socket.IO for real-time visitor count ────────────────────────────────────
  useEffect(() => {
    let socket;
    socket = io(SOCKET_URL, {
      // polling first for Render proxy compatibility, then upgrade to websocket
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });
    socketRef.current = socket;

      socket.on('connect', () => {
        setSocketStatus('connected');
        socket.emit('join-admin');
      });
      socket.on('disconnect', () => setSocketStatus('disconnected'));
      socket.on('connect_error', () => setSocketStatus('error'));

      socket.on('active-visitors', ({ count }) => {
        setActiveCount(count);
      });

    return () => {
      socket?.disconnect();
    };
  }, []);

  // ── Fetch all analytics data ─────────────────────────────────────────────────
  async function loadAll() {
    setLoading(true);
    try {
      const [v, d, g, p, s, pg] = await Promise.all([
        fetchJSON('/analytics/visitors'),
        fetchJSON('/analytics/devices'),
        fetchJSON('/analytics/geo'),
        fetchJSON('/analytics/products'),
        fetchJSON('/analytics/sales'),
        fetchJSON('/analytics/pages'),
      ]);
      setVisitors(v.data);
      setDevices(d.data);
      setGeo(g.data);
      setProducts(p.data);
      setSales(s.data);
      setPages(pg.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('[Analytics Dashboard]', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 md:p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
            socketStatus === 'connected' ? 'bg-green-500/20 text-green-400'
            : socketStatus === 'connecting' ? 'bg-amber-500/20 text-amber-400'
            : 'bg-red-500/20 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full inline-block ${
              socketStatus === 'connected' ? 'bg-green-400 animate-pulse'
              : socketStatus === 'connecting' ? 'bg-amber-400 animate-pulse'
              : 'bg-red-400'
            }`} />
            {socketStatus === 'connected' ? 'Live' : socketStatus === 'connecting' ? 'Connecting…' : 'Offline'}
          </span>
          <button
            onClick={loadAll}
            className="text-xs bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ── Section 1: Real-time ───────────────────────────────────────────── */}
      <section>
        <SectionTitle>Real-Time</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Live counter — always visible, no loading state */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-6 flex items-center gap-5">
            <div className="relative">
              <span className="text-5xl font-extrabold text-indigo-300">{activeCount}</span>
              <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
            </div>
            <div>
              <div className="text-sm font-medium text-indigo-200">Active Visitors Now</div>
              <div className="text-xs text-indigo-400/70 mt-1">Live via WebSocket</div>
            </div>
          </div>

          {loading ? <LoadingRow cols={3} /> : (
            <>
              <StatCard label="Today's Visitors"   value={visitors?.today?.toLocaleString() ?? '–'}   color="cyan"   icon="📅" />
              <StatCard label="This Week"           value={visitors?.thisWeek?.toLocaleString() ?? '–'} color="amber"  icon="📆" />
              <StatCard label="This Month"          value={visitors?.thisMonth?.toLocaleString() ?? '–'} color="green" icon="📊" />
            </>
          )}
        </div>
      </section>

      {/* ── Section 2: Traffic overview ───────────────────────────────────── */}
      <section>
        <SectionTitle>Traffic Overview</SectionTitle>
        {loading ? <div className="h-64 rounded-2xl bg-white/5 animate-pulse" /> : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={visitors?.dailyTrend ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={2} dot={false} name="Visitors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* ── Section 3: Visitor stats cards ────────────────────────────────── */}
      <section>
        <SectionTitle>Visitor Stats</SectionTitle>
        {loading ? <LoadingRow cols={4} /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Visitors"     value={visitors?.total?.toLocaleString() ?? '–'}                color="purple" icon="🌐" />
            <StatCard label="New Visitors"        value={visitors?.newVisitors?.toLocaleString() ?? '–'}          color="cyan"   icon="✨" />
            <StatCard label="Returning Visitors"  value={visitors?.returningVisitors?.toLocaleString() ?? '–'}    color="amber"  icon="🔄" />
            <StatCard label="Avg Session Duration" value={formatDuration(visitors?.avgSessionDuration)}           color="green"  icon="⏱️" />
          </div>
        )}
      </section>

      {/* ── Section 4: Devices ────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Device Analytics (Last 30 Days)</SectionTitle>
        {loading ? <LoadingRow cols={2} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Device Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={devices?.devices ?? []}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ type, percentage }) => `${type} ${percentage}%`}
                    labelLine={false}
                  >
                    {(devices?.devices ?? []).map((entry) => (
                      <Cell key={entry.type} fill={DEVICE_COLORS[entry.type] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center flex-wrap mt-2">
                {(devices?.devices ?? []).map(d => (
                  <span key={d.type} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: DEVICE_COLORS[d.type] || '#6b7280' }} />
                    {d.type} ({d.percentage}%)
                  </span>
                ))}
              </div>
            </div>

            {/* Browser + OS tables */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Top Browsers</h3>
                {(devices?.browsers ?? []).slice(0, 5).map((b, i) => {
                  const total = (devices?.browsers ?? []).reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
                  return (
                    <div key={b.name} className="flex items-center gap-2 mb-2">
                      <span className="text-xs w-20 text-gray-300">{b.name}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Operating Systems</h3>
                {(devices?.os ?? []).slice(0, 5).map((o) => {
                  const total = (devices?.os ?? []).reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((o.count / total) * 100) : 0;
                  return (
                    <div key={o.name} className="flex items-center gap-2 mb-2">
                      <span className="text-xs w-20 text-gray-300">{o.name}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 5: Sales ──────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Sales Analytics</SectionTitle>
        {loading ? <LoadingRow cols={4} /> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Revenue Today"  value={formatCurrency(sales?.daily?.revenue)}   sub={`${sales?.daily?.orders ?? 0} orders`}   color="green"  icon="💰" />
              <StatCard label="Revenue Weekly" value={formatCurrency(sales?.weekly?.revenue)}  sub={`${sales?.weekly?.orders ?? 0} orders`}  color="cyan"   icon="📈" />
              <StatCard label="Revenue Monthly" value={formatCurrency(sales?.monthly?.revenue)} sub={`${sales?.monthly?.orders ?? 0} orders`} color="amber"  icon="📅" />
              <StatCard label="Total Revenue"  value={formatCurrency(sales?.total?.revenue)}   sub={`${sales?.total?.orders ?? 0} total orders`} color="purple" icon="💎" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sales?.dailyTrend ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                    formatter={(v, name) => [name === 'revenue' ? formatCurrency(v) : v, name === 'revenue' ? 'Revenue' : 'Orders']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders"  fill="#6366f1" name="Orders"  radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>

      {/* ── Section 6: Product analytics ──────────────────────────────────── */}
      <section>
        <SectionTitle>Product Analytics (Last 30 Days)</SectionTitle>
        {loading ? <div className="h-40 rounded-2xl bg-white/5 animate-pulse" /> : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProductTable title="Most Viewed" icon="👁" data={products?.mostViewed ?? []} valueKey="views" valueLabel="Views" />
            <ProductTable title="Most Added to Cart" icon="🛒" data={products?.mostCarted ?? []} valueKey="cartAdds" valueLabel="Cart Adds" />
            <ProductTable title="Best Selling" icon="🏆" data={products?.bestSelling ?? []} valueKey="orders" valueLabel="Orders" />
          </div>
        )}
      </section>

      {/* ── Section 7: Geographic ──────────────────────────────────────────── */}
      <section>
        <SectionTitle>Geographic Distribution (Last 30 Days)</SectionTitle>
        {loading ? <LoadingRow cols={2} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Top Countries</h3>
              {(geo?.countries ?? []).length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">No geolocation data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={geo?.countries ?? []} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis type="category" dataKey="country" tick={{ fontSize: 10, fill: '#9ca3af' }} width={55} />
                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Visitors" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Top Pages</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(pages ?? []).slice(0, 15).map((p, i) => (
                  <div key={p.path} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-gray-300 truncate max-w-[60%]">{p.path || '/'}</span>
                    <div className="flex gap-3 text-gray-500">
                      <span>{p.views} views</span>
                      <span>{p.uniqueVisitors} uniq</span>
                    </div>
                  </div>
                ))}
                {(pages ?? []).length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-8">No page view data yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
}

// ─── Product Table Component ──────────────────────────────────────────────────
function ProductTable({ title, icon, data, valueKey, valueLabel }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{icon} {title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-8">No data yet</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 8).map((p, i) => (
            <div key={p.productId || i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-gray-500 w-4 shrink-0">{i + 1}.</span>
                <span className="text-gray-200 truncate">{p.name || `Product ${i + 1}`}</span>
              </div>
              <span className="text-indigo-400 font-medium shrink-0 ml-2">{p[valueKey]} {valueLabel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
