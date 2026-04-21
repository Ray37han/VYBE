import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiFileText,
  FiFilter,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiTruck,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { deliveryAPI } from '../../api';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_OPTIONS = STATUS_TABS.filter((status) => status !== 'All');
const COURIERS = ['Pathao', 'Steadfast', 'RedX'];
const PAGE_SIZE = 20;

const STATUS_META = {
  Pending: {
    badge: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  Confirmed: {
    badge: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
    dot: 'bg-sky-400',
  },
  Processing: {
    badge: 'bg-blue-500/15 text-blue-200 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  Shipped: {
    badge: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  Delivered: {
    badge: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  Cancelled: {
    badge: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
    dot: 'bg-rose-400',
  },
};

function money(value) {
  return `BDT ${Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sanitizeFileName(value) {
  const normalized = String(value || 'image').trim().replace(/\s+/g, '-');
  const safe = normalized.replace(/[^a-zA-Z0-9._-]/g, '');
  return safe || 'image';
}

function isFullUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function getProducts(order) {
  if (Array.isArray(order?.products) && order.products.length > 0) {
    return order.products;
  }

  return [
    {
      name: order?.productName || order?.customer_name || 'Product',
      quantity: Number(order?.quantity || 1),
      price: Number(order?.price || 0),
      image_url: order?.productImageUrl || order?.image_url || '',
    },
  ];
}

function getSubtotal(order) {
  if (Number(order?.subtotal) > 0) {
    return Number(order.subtotal);
  }

  return getProducts(order).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
}

function getDeliveryCharge(order) {
  if (Number.isFinite(Number(order?.deliveryCharge))) {
    return Number(order.deliveryCharge);
  }

  return Math.max(0, Number(order?.total || 0) - getSubtotal(order));
}

function getStatusTimeline(order) {
  const timeline = Array.isArray(order?.statusTimeline) ? [...order.statusTimeline] : [];

  if (timeline.length === 0) {
    timeline.push({
      status: order?.status || 'Pending',
      changedAt: order?.updatedAt || order?.createdAt || new Date().toISOString(),
      note: '',
      changedBy: 'System',
    });
  }

  return timeline.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
}

function toErrorMessage(error, fallback = 'Operation failed') {
  return (
    error?.response?.data?.message ||
    error?.userMessage ||
    error?.message ||
    fallback
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {status}
    </span>
  );
}

function ProductPreview({ order }) {
  const products = getProducts(order);
  const primary = products[0];
  const moreCount = products.length - 1;
  const imageUrl = primary?.image_url;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {isFullUrl(imageUrl) ? (
          <img
            src={imageUrl}
            alt={primary?.name || 'Product'}
            loading="lazy"
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">No Img</div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-100" title={primary?.name || '-'}>
          {primary?.name || '-'}
        </p>
        {moreCount > 0 && (
          <p className="text-xs text-cyan-300">+{moreCount} more</p>
        )}
      </div>
    </div>
  );
}

function ActionButton({ title, icon, onClick, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {icon}
      {title}
    </button>
  );
}

function Modal({ title, subtitle, children, onClose, maxWidth = 'max-w-4xl' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={`w-full ${maxWidth} rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/60`}>
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function buildVisiblePages(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
}

function waitForImages(rootNode) {
  if (!rootNode) return Promise.resolve();

  const images = [...rootNode.querySelectorAll('img')];
  return Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();

      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })
  );
}

function InvoiceSheet({ order }) {
  if (!order) {
    return null;
  }

  const products = getProducts(order);
  const subtotal = getSubtotal(order);
  const deliveryCharge = getDeliveryCharge(order);

  return (
    <div className="invoice-sheet w-[780px] max-w-full rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="https://vybebd.store/favicon.ico"
            alt="VybeBD"
            crossOrigin="anonymous"
            className="h-9 w-9 rounded-lg border border-slate-200 object-cover"
          />
          <div>
            <p className="text-xl font-bold tracking-tight">VybeBD Delivery Invoice</p>
            <p className="text-xs text-slate-500">vybebd.store</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase text-slate-500">Order ID</p>
          <p className="font-mono text-sm font-semibold">{order.orderId}</p>
          <p className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</p>
          <p className="text-sm font-semibold">{order.customerName || order.customer_name}</p>
          <p className="mt-1 text-sm text-slate-700">{order.phone}</p>
          <p className="mt-1 text-sm text-slate-700">{order.address}</p>
          <p className="mt-1 text-sm text-slate-700">{order.district}</p>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</p>
          <p className="text-sm text-slate-700">Method: <span className="font-semibold">{order.paymentMethod || order.payment_method}</span></p>
          <p className="mt-1 text-sm text-slate-700">Subtotal: <span className="font-semibold">{money(subtotal)}</span></p>
          <p className="mt-1 text-sm text-slate-700">Delivery Charge: <span className="font-semibold">{money(deliveryCharge)}</span></p>
          <p className="mt-1 text-sm text-slate-700">Total: <span className="font-semibold">{money(order.total)}</span></p>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Image</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, idx) => (
              <tr key={`${item.name}-${idx}`} className="border-t border-slate-200">
                <td className="px-3 py-2">
                  <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {isFullUrl(item.image_url) ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">No Img</div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">{item.name}</td>
                <td className="px-3 py-2 text-slate-700">{item.quantity}</td>
                <td className="px-3 py-2 text-slate-700">{money(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function toCsvValue(value) {
  const raw = String(value ?? '');
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return raw;
}

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: PAGE_SIZE });
  const [summary, setSummary] = useState({
    todayTotal: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });
  const [statusCounts, setStatusCounts] = useState({});

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [districtPool, setDistrictPool] = useState([]);

  const [detailsOrder, setDetailsOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState('Pending');
  const [statusNote, setStatusNote] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [courierOrder, setCourierOrder] = useState(null);
  const [courierForm, setCourierForm] = useState({
    courier: 'Steadfast',
    tracking_id: '',
    delivery_agent: '',
  });
  const [courierSubmitting, setCourierSubmitting] = useState(false);

  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [pdfLoadingOrderId, setPdfLoadingOrderId] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);

  const invoiceCaptureRef = useRef(null);

  const visiblePages = useMemo(
    () => buildVisiblePages(page, Number(pagination.totalPages || 1)),
    [page, pagination.totalPages]
  );

  const districtOptions = useMemo(
    () => ['All', ...districtPool],
    [districtPool]
  );

  const setOrMergeDistricts = useCallback((newOrders) => {
    const incoming = newOrders
      .map((item) => String(item.district || '').trim())
      .filter(Boolean);

    setDistrictPool((prev) => {
      const next = new Set([...prev, ...incoming]);
      return [...next].sort((a, b) => a.localeCompare(b));
    });
  }, []);

  const fetchOrders = useCallback(
    async ({ soft = false } = {}) => {
      if (soft) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
        };

        if (statusFilter !== 'All') params.status = statusFilter;
        if (districtFilter !== 'All') params.district = districtFilter;

        if (debouncedSearch) {
          if (/^VYBE-/i.test(debouncedSearch)) {
            params.orderId = debouncedSearch;
          } else {
            params.phone = debouncedSearch;
          }
        }

        const data = await deliveryAPI.getOrders(params);
        const nextOrders = data.orders || [];

        setOrders(nextOrders);
        setPagination(
          data.pagination || {
            page: 1,
            totalPages: 1,
            total: nextOrders.length,
            limit: PAGE_SIZE,
          }
        );
        setSummary(
          data.summary || {
            todayTotal: 0,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
          }
        );
        setStatusCounts(data.statusCounts || {});
        setOrMergeDistricts(nextOrders);
      } catch (error) {
        toast.error(toErrorMessage(error, 'Failed to load delivery orders'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter, districtFilter, debouncedSearch, setOrMergeDistricts]
  );

  const fetchOrderDetails = useCallback(async (orderId, silent = false) => {
    try {
      const data = await deliveryAPI.getOrderById(orderId);
      return data.order;
    } catch (error) {
      if (!silent) {
        toast.error(toErrorMessage(error, 'Could not load order details'));
      }
      return null;
    }
  }, []);

  const updateOrderInList = useCallback((updatedOrder) => {
    if (!updatedOrder?.orderId) return;

    setOrders((prev) =>
      prev.map((item) => (item.orderId === updatedOrder.orderId ? { ...item, ...updatedOrder } : item))
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const onAfterPrint = () => setPrintOrder(null);
    window.addEventListener('afterprint', onAfterPrint);
    return () => window.removeEventListener('afterprint', onAfterPrint);
  }, []);

  const cardData = [
    {
      title: 'Total Orders (Today)',
      value: summary.todayTotal,
      icon: <FiClock className="h-5 w-5" />,
      accents: 'from-slate-500/20 to-slate-700/5 border-slate-400/20',
    },
    {
      title: 'Pending Orders',
      value: summary.pending,
      icon: <FiFileText className="h-5 w-5" />,
      accents: 'from-amber-500/20 to-amber-800/5 border-amber-400/20',
    },
    {
      title: 'Processing Orders',
      value: summary.processing,
      icon: <FiPackage className="h-5 w-5" />,
      accents: 'from-blue-500/20 to-blue-800/5 border-blue-400/20',
    },
    {
      title: 'Shipped Orders',
      value: summary.shipped,
      icon: <FiTruck className="h-5 w-5" />,
      accents: 'from-cyan-500/20 to-cyan-800/5 border-cyan-400/20',
    },
    {
      title: 'Delivered Orders',
      value: summary.delivered,
      icon: <FiCheckCircle className="h-5 w-5" />,
      accents: 'from-emerald-500/20 to-emerald-800/5 border-emerald-400/20',
    },
  ];

  function getStatusCount(status) {
    if (status === 'All') {
      return Number(pagination.total || 0);
    }

    return Number(statusCounts[status] || 0);
  }

  async function openDetails(order) {
    setDetailsLoading(true);
    setDetailsOrder(null);

    const fullOrder = (await fetchOrderDetails(order.orderId, true)) || order;
    setDetailsOrder(fullOrder);
    setStatusDraft(fullOrder.status || 'Pending');
    setStatusNote('');
    setDetailsLoading(false);
  }

  async function submitStatusUpdate() {
    if (!detailsOrder?.orderId) return;

    setStatusSubmitting(true);
    try {
      const data = await deliveryAPI.updateStatus({
        orderId: detailsOrder.orderId,
        status: statusDraft,
        adminNote: statusNote.trim(),
      });

      const updatedOrder = data.order;
      setDetailsOrder(updatedOrder);
      updateOrderInList(updatedOrder);
      toast.success(`Status updated to ${statusDraft}`);
      fetchOrders({ soft: true });
      setStatusNote('');
    } catch (error) {
      toast.error(toErrorMessage(error, 'Failed to update status'));
    } finally {
      setStatusSubmitting(false);
    }
  }

  function openCourierModal(order) {
    setCourierOrder(order);
    setCourierForm({
      courier: order.courier || 'Steadfast',
      tracking_id: order.tracking_id || order.trackingId || '',
      delivery_agent: order.delivery_agent || order.deliveryAgent || '',
    });
  }

  async function submitCourierAssignment() {
    if (!courierOrder?.orderId) return;

    setCourierSubmitting(true);
    try {
      const data = await deliveryAPI.assignCourier({
        orderId: courierOrder.orderId,
        courier: courierForm.courier,
        tracking_id: courierForm.tracking_id.trim(),
        delivery_agent: courierForm.delivery_agent.trim(),
      });

      const updatedOrder = data.order;
      updateOrderInList(updatedOrder);

      if (detailsOrder?.orderId === updatedOrder.orderId) {
        setDetailsOrder(updatedOrder);
      }

      toast.success(`Assigned ${courierForm.courier}${data.trackingId ? ` (${data.trackingId})` : ''}`);
      setCourierOrder(null);
      fetchOrders({ soft: true });
    } catch (error) {
      toast.error(toErrorMessage(error, 'Failed to assign courier'));
    } finally {
      setCourierSubmitting(false);
    }
  }

  async function prepareInvoice(order) {
    const fullOrder = (await fetchOrderDetails(order.orderId, true)) || order;
    setInvoiceOrder(fullOrder);

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await waitForImages(invoiceCaptureRef.current);

    return fullOrder;
  }

  async function downloadPdf(order) {
    setPdfLoadingOrderId(order.orderId);

    try {
      const fullOrder = await prepareInvoice(order);
      const node = invoiceCaptureRef.current;

      if (!node) {
        throw new Error('Invoice container not ready');
      }

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const drawableWidth = pageWidth - margin * 2;
      const drawableHeight = pageHeight - margin * 2;

      const ratio = Math.min(drawableWidth / canvas.width, drawableHeight / canvas.height);
      const targetWidth = canvas.width * ratio;
      const targetHeight = canvas.height * ratio;
      const offsetX = (pageWidth - targetWidth) / 2;
      const offsetY = margin;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', offsetX, offsetY, targetWidth, targetHeight);
      pdf.save(`VybeBD-Invoice-${fullOrder.orderId}.pdf`);
      toast.success(`Invoice PDF downloaded for ${fullOrder.orderId}`);
    } catch (error) {
      toast.error(toErrorMessage(error, 'PDF generation failed'));
    } finally {
      setPdfLoadingOrderId('');
    }
  }

  async function printMemo(order) {
    try {
      const fullOrder = await prepareInvoice(order);
      setPrintOrder(fullOrder);

      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      window.print();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Print failed'));
    }
  }

  async function downloadProductImage(imageUrl, orderId, productName, index) {
    if (!isFullUrl(imageUrl)) {
      toast.error('No image URL available for this product');
      return;
    }

    const baseName = sanitizeFileName(`${orderId || 'order'}-${productName || `product-${index + 1}`}`);

    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const extension = blob.type?.split('/')?.[1]?.split('+')?.[0] || 'jpg';
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${baseName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success('Product image downloaded');
    } catch (_error) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
      toast('Direct download blocked by source. Opened image in a new tab.');
    }
  }

  async function exportCsv() {
    setCsvLoading(true);

    try {
      const baseParams = { limit: 200 };
      if (statusFilter !== 'All') baseParams.status = statusFilter;
      if (districtFilter !== 'All') baseParams.district = districtFilter;
      if (debouncedSearch) {
        if (/^VYBE-/i.test(debouncedSearch)) {
          baseParams.orderId = debouncedSearch;
        } else {
          baseParams.phone = debouncedSearch;
        }
      }

      const firstPage = await deliveryAPI.getOrders({ ...baseParams, page: 1 });
      const maxPages = Math.min(Number(firstPage?.pagination?.totalPages || 1), 25);
      const allOrders = [...(firstPage.orders || [])];

      for (let current = 2; current <= maxPages; current += 1) {
        const nextPage = await deliveryAPI.getOrders({ ...baseParams, page: current });
        allOrders.push(...(nextPage.orders || []));
      }

      if (allOrders.length === 0) {
        toast.error('No orders available for CSV export');
        setCsvLoading(false);
        return;
      }

      const headers = [
        'Order ID',
        'Customer Name',
        'Phone',
        'District',
        'Address',
        'Status',
        'Payment Method',
        'Courier',
        'Tracking ID',
        'Product Names',
        'Total',
        'Created At',
      ];

      const rows = allOrders.map((order) => {
        const productNames = getProducts(order).map((item) => item.name).join(' | ');

        return [
          order.orderId,
          order.customerName || order.customer_name,
          order.phone,
          order.district,
          order.address,
          order.status,
          order.paymentMethod || order.payment_method,
          order.courier,
          order.trackingId || order.tracking_id,
          productNames,
          String(order.total || 0),
          formatDate(order.createdAt),
        ].map(toCsvValue).join(',');
      });

      const csvText = `${headers.join(',')}\n${rows.join('\n')}`;
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `vybebd-delivery-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      if (Number(firstPage?.pagination?.totalPages || 1) > maxPages) {
        toast.success(`CSV exported (${allOrders.length} rows, first ${maxPages} pages)`);
      } else {
        toast.success(`CSV exported (${allOrders.length} rows)`);
      }
    } catch (error) {
      toast.error(toErrorMessage(error, 'CSV export failed'));
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-invoice,
          .printable-invoice * {
            visibility: visible !important;
          }
          .printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 20px;
          }
          .invoice-sheet {
            width: 100% !important;
            max-width: 100% !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-4 pb-6 pt-6 md:px-6">
        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -top-8 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">VybeBD Operations</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">Delivery Management System</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Real-time execution panel for delivery teams in Bangladesh with invoice, print memo, courier assignment, and status timeline.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/admin"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
              >
                Back to Admin
              </Link>

              <button
                type="button"
                onClick={exportCsv}
                disabled={csvLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiDownload className="h-4 w-4" />
                {csvLoading ? 'Exporting...' : 'Export CSV'}
              </button>

              <button
                type="button"
                onClick={() => fetchOrders({ soft: true })}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {cardData.map((card) => (
              <div
                key={card.title}
                className={`rounded-2xl border bg-gradient-to-br p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] ${card.accents}`}
              >
                <div className="flex items-center justify-between text-slate-300">
                  {card.icon}
                  <span className="text-xs uppercase tracking-wide text-slate-400">Live</span>
                </div>
                <p className="mt-3 text-3xl font-bold text-white">{Number(card.value || 0).toLocaleString('en-BD')}</p>
                <p className="mt-1 text-xs text-slate-300">{card.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="no-print mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_TABS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === status
                      ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-100'
                      : 'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  {status} ({getStatusCount(status)})
                </button>
              ))}
            </div>

            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by Order ID or phone"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
                <FiFilter className="h-4 w-4 text-slate-500" />
                <select
                  value={districtFilter}
                  onChange={(event) => {
                    setDistrictFilter(event.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-sm text-slate-200 focus:outline-none"
                >
                  {districtOptions.map((district) => (
                    <option key={district} value={district} className="bg-slate-900 text-slate-100">
                      {district === 'All' ? 'All Districts' : district}
                    </option>
                  ))}
                </select>
              </label>

              <div className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
                Showing page {pagination.page || page} of {pagination.totalPages || 1}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          {loading ? (
            <div className="py-24 text-center text-sm text-slate-400">Loading delivery orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-24 text-center text-sm text-slate-400">No orders found for the selected filter.</div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-[1200px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                      {['Order ID', 'Customer Name', 'Phone', 'Product Preview', 'District', 'Payment Method', 'Status', 'Courier', 'Tracking ID', 'Actions'].map((heading) => (
                        <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderId} className="border-b border-white/5 align-top transition hover:bg-white/[0.03]">
                        <td className="px-4 py-3 font-mono text-xs text-cyan-300">{order.orderId}</td>
                        <td className="px-4 py-3 text-sm font-medium text-white">{order.customerName || order.customer_name}</td>
                        <td className="px-4 py-3 text-slate-300">{order.phone}</td>
                        <td className="px-4 py-3"><ProductPreview order={order} /></td>
                        <td className="px-4 py-3 text-slate-300">{order.district}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-200">
                            {order.paymentMethod || order.payment_method}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3 text-slate-300">{order.courier || '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{order.trackingId || order.tracking_id || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <ActionButton
                              title="View Details"
                              icon={<FiEyeIcon />}
                              onClick={() => openDetails(order)}
                            />
                            <ActionButton
                              title="Download PDF"
                              icon={<FiDownload className="h-3.5 w-3.5" />}
                              onClick={() => downloadPdf(order)}
                              disabled={pdfLoadingOrderId === order.orderId}
                            />
                            <ActionButton
                              title="Print Memo"
                              icon={<FiPrinter className="h-3.5 w-3.5" />}
                              onClick={() => printMemo(order)}
                            />
                            <ActionButton
                              title="Assign Courier"
                              icon={<FiTruck className="h-3.5 w-3.5" />}
                              onClick={() => openCourierModal(order)}
                              className="border-cyan-400/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-3 lg:hidden">
                {orders.map((order) => (
                  <article key={order.orderId} className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-lg shadow-black/20">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-cyan-300">{order.orderId}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{order.customerName || order.customer_name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{order.phone}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-3">
                      <ProductPreview order={order} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">District</p>
                        <p className="mt-1">{order.district}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">Payment</p>
                        <p className="mt-1">{order.paymentMethod || order.payment_method}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">Courier</p>
                        <p className="mt-1">{order.courier || '-'}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">Tracking</p>
                        <p className="mt-1 font-mono">{order.trackingId || order.tracking_id || '-'}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openDetails(order)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200"
                      >
                        <FiEyeIcon /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdf(order)}
                        disabled={pdfLoadingOrderId === order.orderId}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 disabled:opacity-50"
                      >
                        <FiDownload className="h-3.5 w-3.5" /> PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => printMemo(order)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200"
                      >
                        <FiPrinter className="h-3.5 w-3.5" /> Print
                      </button>
                      <button
                        type="button"
                        onClick={() => openCourierModal(order)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
                      >
                        <FiTruck className="h-3.5 w-3.5" /> Courier
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        {Number(pagination.totalPages || 1) > 1 ? (
          <div className="no-print mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft className="h-4 w-4" /> Prev
            </button>

            {visiblePages.map((pageNumber, idx) => {
              const previous = visiblePages[idx - 1];
              const showEllipsis = previous && pageNumber - previous > 1;

              return (
                <div key={pageNumber} className="flex items-center gap-2">
                  {showEllipsis ? <span className="text-xs text-slate-500">...</span> : null}
                  <button
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-9 min-w-[36px] rounded-xl px-2 text-sm font-semibold transition ${
                      pageNumber === page
                        ? 'bg-cyan-500 text-slate-950'
                        : 'border border-white/10 bg-slate-900 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {pageNumber}
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(Number(pagination.totalPages || 1), prev + 1))}
              disabled={page >= Number(pagination.totalPages || 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {(detailsOrder || detailsLoading) ? (
        <Modal
          title={detailsOrder ? `Order Details - ${detailsOrder.orderId}` : 'Loading order details'}
          subtitle="Delivery execution record"
          onClose={() => {
            setDetailsOrder(null);
            setDetailsLoading(false);
          }}
        >
          {detailsLoading || !detailsOrder ? (
            <div className="py-20 text-center text-sm text-slate-400">Loading details...</div>
          ) : (
            <div className="max-h-[78vh] overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-3">
                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order Info</p>
                  <p className="mt-2 font-mono text-sm text-cyan-300">{detailsOrder.orderId}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(detailsOrder.createdAt)}</p>
                  <div className="mt-3"><StatusBadge status={detailsOrder.status} /></div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer Info</p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                    <p className="inline-flex items-center gap-2"><FiUser className="h-4 w-4 text-slate-500" /> {detailsOrder.customerName || detailsOrder.customer_name}</p>
                    <p className="inline-flex items-center gap-2"><FiPhone className="h-4 w-4 text-slate-500" /> {detailsOrder.phone}</p>
                    <p className="inline-flex items-start gap-2 sm:col-span-2"><FiMapPin className="mt-0.5 h-4 w-4 text-slate-500" /> {detailsOrder.address}, {detailsOrder.district}</p>
                  </div>
                </section>
              </div>

              <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Product List</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] text-sm">
                    <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-2">Image</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Quantity</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getProducts(detailsOrder).map((item, idx) => (
                        <tr key={`${item.name}-${idx}`} className="border-b border-white/5">
                          <td className="px-4 py-2">
                            <div className="h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-slate-800">
                              {isFullUrl(item.image_url) ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  loading="lazy"
                                  crossOrigin="anonymous"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">No Img</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-slate-100">{item.name}</td>
                          <td className="px-4 py-2 text-slate-300">{item.quantity}</td>
                          <td className="px-4 py-2 text-slate-300">{money(item.price)}</td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => downloadProductImage(item.image_url, detailsOrder.orderId, item.name, idx)}
                              disabled={!isFullUrl(item.image_url)}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                              title={isFullUrl(item.image_url) ? 'Download product image' : 'Image URL not available'}
                            >
                              <FiDownload className="h-3.5 w-3.5" />
                              Image
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payment Summary</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-200">
                    <p className="flex items-center justify-between"><span>Subtotal</span> <span className="font-semibold">{money(getSubtotal(detailsOrder))}</span></p>
                    <p className="flex items-center justify-between"><span>Delivery Charge</span> <span className="font-semibold">{money(getDeliveryCharge(detailsOrder))}</span></p>
                    <p className="flex items-center justify-between border-t border-white/10 pt-2 text-base"><span>Total</span> <span className="font-bold text-cyan-300">{money(detailsOrder.total)}</span></p>
                    <p className="text-xs text-slate-400">Payment Method: {detailsOrder.paymentMethod || detailsOrder.payment_method}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status Update</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <select
                      value={statusDraft}
                      onChange={(event) => setStatusDraft(event.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="bg-slate-900">
                          {status}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={submitStatusUpdate}
                      disabled={statusSubmitting}
                      className="rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {statusSubmitting ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>

                  <textarea
                    value={statusNote}
                    onChange={(event) => setStatusNote(event.target.value)}
                    rows={2}
                    placeholder="Add internal note (optional)"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none"
                  />
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status Timeline</p>
                <div className="mt-3 space-y-2">
                  {getStatusTimeline(detailsOrder).map((item, idx) => (
                    <div key={`${item.status}-${item.changedAt}-${idx}`} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                      <span className={`mt-1 h-2 w-2 rounded-full ${(STATUS_META[item.status] || STATUS_META.Pending).dot}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-100">
                          <span className="font-semibold">{item.status}</span>
                          {' by '}
                          <span className="text-slate-300">{item.changedBy || 'System'}</span>
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(item.changedAt)}</p>
                        {item.note ? <p className="mt-1 text-xs text-slate-300">{item.note}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadPdf(detailsOrder)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <FiDownload className="h-4 w-4" /> Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => printMemo(detailsOrder)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <FiPrinter className="h-4 w-4" /> Print Memo
                </button>

                <button
                  type="button"
                  onClick={() => openCourierModal(detailsOrder)}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  <FiTruck className="h-4 w-4" /> Assign Courier
                </button>
              </section>
            </div>
          )}
        </Modal>
      ) : null}

      {courierOrder ? (
        <Modal
          title={`Assign Courier - ${courierOrder.orderId}`}
          subtitle="Dispatch order and save tracking details"
          maxWidth="max-w-xl"
          onClose={() => setCourierOrder(null)}
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
              <p><span className="text-slate-500">Customer:</span> {courierOrder.customerName || courierOrder.customer_name}</p>
              <p><span className="text-slate-500">Phone:</span> {courierOrder.phone}</p>
              <p><span className="text-slate-500">Address:</span> {courierOrder.address}, {courierOrder.district}</p>
              <p><span className="text-slate-500">COD Amount:</span> {(courierOrder.paymentMethod || courierOrder.payment_method) === 'Cash On Delivery' ? money(courierOrder.total) : 'BDT 0 (Prepaid)'}</p>
            </div>

            <div className="grid gap-3">
              <label className="text-xs text-slate-400">
                Courier
                <select
                  value={courierForm.courier}
                  onChange={(event) => setCourierForm((prev) => ({ ...prev, courier: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
                >
                  {COURIERS.map((courier) => (
                    <option key={courier} value={courier} className="bg-slate-900">
                      {courier}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs text-slate-400">
                Tracking ID (optional)
                <input
                  type="text"
                  value={courierForm.tracking_id}
                  onChange={(event) => setCourierForm((prev) => ({ ...prev, tracking_id: event.target.value }))}
                  placeholder="Auto-generated if left empty"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none"
                />
              </label>

              <label className="text-xs text-slate-400">
                Delivery Agent (optional)
                <input
                  type="text"
                  value={courierForm.delivery_agent}
                  onChange={(event) => setCourierForm((prev) => ({ ...prev, delivery_agent: event.target.value }))}
                  placeholder="Agent or rider name"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={submitCourierAssignment}
              disabled={courierSubmitting}
              className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {courierSubmitting ? 'Assigning...' : `Assign ${courierForm.courier}`}
            </button>
          </div>
        </Modal>
      ) : null}

      <div className="pointer-events-none fixed -left-[200vw] top-0 opacity-0" aria-hidden="true">
        <div ref={invoiceCaptureRef}>
          <InvoiceSheet order={invoiceOrder} />
        </div>
      </div>

      <div className="printable-invoice hidden">
        <InvoiceSheet order={printOrder} />
      </div>
    </div>
  );
}

function FiEyeIcon() {
  return (
    <span className="inline-flex h-3.5 w-3.5 items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </span>
  );
}
