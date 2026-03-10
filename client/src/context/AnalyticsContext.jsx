/**
 * Analytics Context & Provider
 *
 * Manages:
 * - Visitor session ID (persistent per browser)
 * - Socket.IO connection for real-time active visitor count
 * - Page view tracking on route change
 * - Product event tracking helper
 *
 * All tracking is fire-and-forget — it never blocks UI interactions.
 */

import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/index';

const AnalyticsContext = createContext(null);

// Derive the socket server URL from the API env var (strip /api suffix)
const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://vybe-backend-93eu.onrender.com/api';
const SOCKET_URL = RAW_API_URL.replace(/\/api$/, '');
const API_BASE = RAW_API_URL;

/**
 * Generate or retrieve a persistent session ID for this browser.
 * Uses sessionStorage so each tab gets a unique ID, but IDs survive refreshes.
 */
function getOrCreateSessionId() {
  const storageKey = 'vybe_sid';
  let sid = sessionStorage.getItem(storageKey);
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
    sessionStorage.setItem(storageKey, sid);
  }
  return sid;
}

/**
 * Non-blocking fetch wrapper — never throws, never awaited by caller
 */
async function fireAndForget(url, body) {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch {
    // Silently ignore network errors — analytics must never break the app
  }
}

export function AnalyticsProvider({ children }) {
  const location = useLocation();
  const { user } = useAuthStore();

  const sessionId = useRef(getOrCreateSessionId());
  const socketRef = useRef(null);
  const pageEntryTime = useRef(Date.now());
  const prevPath = useRef(null);

  // ── Socket.IO connection ─────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      query: { sessionId: sessionId.current },
      // Start with polling (reliable through Render/Railway proxy), then upgrade to websocket
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Send periodic heartbeats every 30 s to keep active status current
    const heartbeat = setInterval(() => {
      socket.emit('heartbeat');
    }, 30_000);

    return () => {
      clearInterval(heartbeat);
      socket.disconnect();
    };
  }, []); // only once on mount

  // ── Session registration ─────────────────────────────────────────────────────
  useEffect(() => {
    fireAndForget(`${API_BASE}/analytics/session`, {
      sessionId: sessionId.current,
      userId: user?._id || null,
    });
  }, [user?._id]);

  // ── Page view tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Record duration spent on the previous page before tracking new one
    if (prevPath.current !== null) {
      const duration = Math.round((Date.now() - pageEntryTime.current) / 1000);
      fireAndForget(`${API_BASE}/analytics/pageview`, {
        sessionId: sessionId.current,
        userId: user?._id || null,
        url: window.location.href,
        path: prevPath.current,
        title: document.title,
        referrer: document.referrer,
        duration,
      });
    }

    pageEntryTime.current = Date.now();
    prevPath.current = currentPath;

    // Track the new page immediately with 0 duration (duration updated on next navigation)
    fireAndForget(`${API_BASE}/analytics/pageview`, {
      sessionId: sessionId.current,
      userId: user?._id || null,
      url: window.location.href,
      path: currentPath,
      title: document.title,
      referrer: document.referrer,
      duration: 0,
    });
  }, [location.pathname, location.search]);

  // ── Product event tracker (exposed via context) ──────────────────────────────
  const trackEvent = useCallback((eventType, data = {}) => {
    fireAndForget(`${API_BASE}/analytics/event`, {
      sessionId: sessionId.current,
      userId: user?._id || null,
      eventType,
      ...data,
    });
  }, [user?._id]);

  const value = {
    sessionId: sessionId.current,
    socket: socketRef,
    trackEvent,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used inside <AnalyticsProvider>');
  return ctx;
}
