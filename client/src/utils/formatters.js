// ── Currency ───────────────────────────────────────────────────
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

// ── Date / time ────────────────────────────────────────────────
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });

export const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-IN', {
    hour:   '2-digit',
    minute: '2-digit',
  });

export const formatDateTime = (dateStr) =>
  `${formatDate(dateStr)} at ${formatTime(dateStr)}`;

// ── Text ───────────────────────────────────────────────────────
export const truncate = (str, maxLen = 80) =>
  str && str.length > maxLen ? str.slice(0, maxLen) + '…' : str;

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

// ── Order status label ─────────────────────────────────────────
export const statusLabel = (status) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());