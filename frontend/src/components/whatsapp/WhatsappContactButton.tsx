import { useAppSelector } from '../../hooks/redux'
import { buildWhatsappUrl, composeWhatsappMessage } from '../../lib/whatsapp'

interface WhatsappContactButtonProps {
  merchantWhatsappPhone: string | null | undefined
  merchantName?: string | null
  commerceName?: string | null
  productName?: string | null
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Renders a "Contacter sur WhatsApp" button only if the merchant has a
 * usable WhatsApp number. Opens wa.me in a new tab with a pre-filled message.
 *
 * Returns `null` when no number is available — callers do not need to guard.
 */
const WhatsappContactButton = ({
  merchantWhatsappPhone,
  merchantName,
  commerceName,
  productName,
  size = 'md',
  className = '',
}: WhatsappContactButtonProps) => {
  const customerName = useAppSelector((s) => s.auth.user?.name)

  const message = composeWhatsappMessage({
    merchantName,
    commerceName,
    productName,
    customerName,
  })
  const href = buildWhatsappUrl(merchantWhatsappPhone, message)
  if (!href) return null

  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 ${pad} rounded-lg font-medium bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 ${className}`}
      aria-label="Contacter le commerçant sur WhatsApp"
    >
      <svg
        className={iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l.36.572-1.018 3.715 3.737-.99zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.521.074-.794.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
      </svg>
      <span>WhatsApp</span>
    </a>
  )
}

export default WhatsappContactButton
