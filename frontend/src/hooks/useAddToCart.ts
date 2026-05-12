import { useCallback } from 'react'
import { useAppDispatch } from './redux'
import { addToCart, clearLastError } from '../store/slices/cartSlice'
import { Product } from '../types'
import { store } from '../store/store'

type GlobalNotify = (n: { type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }) => void

function notify(input: { type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }) {
  const w = window as unknown as { addNotification?: GlobalNotify }
  if (typeof w.addNotification === 'function') w.addNotification(input)
}

/**
 * Dispatch addToCart and surface the reducer's stock-guard outcome:
 *  - clamped → warning toast with the reducer's message
 *  - refused (out of stock / already at max) → error toast
 *  - applied as requested → success toast
 *
 * The cart reducer is the single source of truth for clamping; this hook only
 * translates state changes into user-visible feedback.
 */
export function useAddToCart() {
  const dispatch = useAppDispatch()

  return useCallback((product: Product, quantity: number = 1) => {
    const before = store.getState().cart
    const beforeItem = before.items.find(i => i.productId === product.id)
    const beforeQty = beforeItem?.quantity ?? 0

    dispatch(addToCart({ product, quantity }))

    const after = store.getState().cart
    const afterItem = after.items.find(i => i.productId === product.id)
    const afterQty = afterItem?.quantity ?? 0
    const applied = afterQty - beforeQty

    if (after.lastError) {
      notify({
        type: applied > 0 ? 'warning' : 'error',
        title: applied > 0 ? 'Stock limité' : 'Indisponible',
        message: after.lastError,
      })
      dispatch(clearLastError())
    } else if (applied > 0) {
      notify({
        type: 'success',
        title: 'Produit ajouté',
        message: `${product.name} a été ajouté au panier.`,
      })
    }
  }, [dispatch])
}
