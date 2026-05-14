import type { OrderStatus } from '../types'

interface StatusMeta {
  label: string
  color: string
  cancellable: boolean
}

const STATUS_META: Record<OrderStatus, StatusMeta> = {
  Waiting: {
    label: 'En attente',
    color: 'bg-accent-100 text-accent-700 border-accent-300',
    cancellable: true,
  },
  Accepted: {
    label: 'Acceptée',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    cancellable: true,
  },
  In_Progress: {
    label: 'En préparation',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    cancellable: true,
  },
  Shipped: {
    label: 'Expédiée',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    cancellable: false,
  },
  Delivered: {
    label: 'Livrée',
    color: 'bg-brand-100 text-brand-700 border-brand-300',
    cancellable: false,
  },
  Completed: {
    label: 'Terminée',
    color: 'bg-green-100 text-green-800 border-green-200',
    cancellable: false,
  },
  Cancelled: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800 border-red-200',
    cancellable: false,
  },
}

export function getStatusMeta(status: OrderStatus | string | undefined | null): StatusMeta {
  if (status && status in STATUS_META) {
    return STATUS_META[status as OrderStatus]
  }
  return {
    label: status ? String(status) : 'Inconnu',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    cancellable: false,
  }
}

export function formatOrderDate(iso: string | undefined | null, includeTime = true): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

// Re-export the currency-aware formatter so existing imports keep working.
// Callers that have a currency in hand should pass it; the default falls
// back to EUR to preserve behavior on legacy data.
export { formatPrice } from './format'
