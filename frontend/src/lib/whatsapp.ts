/**
 * WhatsApp deep-link helpers.
 *
 * The "click-to-chat" URL is documented at https://faq.whatsapp.com/5913398998672934 —
 * `wa.me/<phone>?text=<urlencoded>` opens the WhatsApp app on mobile (or
 * WhatsApp Web on desktop) with a pre-filled message. The user still has to
 * tap "Send" — there is no silent delivery from this link.
 *
 * IMPORTANT: wa.me does not validate the number — a malformed number opens
 * a generic "phone is not valid" page in WhatsApp, with no signal back to
 * the merchant. That's why we validate at the boundary instead of trusting
 * input. See `validateWhatsappPhone` below.
 */

// E.164 allows 8–15 digits including country code. Real country codes are
// 1–3 digits, leaving at least 5 digits of subscriber number — enough to
// catch obvious truncation while staying lenient on edge cases.
const MIN_DIGITS = 8
const MAX_DIGITS = 15

export type WhatsappPhoneValidation =
  | { valid: true; normalized: string }
  | { valid: false; reason: 'empty' | 'too_short' | 'too_long' | 'leading_zero' | 'non_digits_only'; message: string }

/**
 * Strip everything that isn't a digit. Does NOT enforce any rule — use
 * `validateWhatsappPhone` if you need to check the result.
 */
export function normalizeWhatsappPhone(input: string | null | undefined): string | null {
  if (!input) return null
  const digits = input.replace(/[^0-9]/g, '')
  return digits.length > 0 ? digits : null
}

/**
 * Validate a WhatsApp number against minimal E.164 expectations:
 *  - between 8 and 15 digits
 *  - no leading 0 (national-format numbers don't route on wa.me)
 *
 * Returns either `{ valid: true, normalized }` or `{ valid: false, reason, message }`
 * with a user-facing French message ready for inline display.
 */
export function validateWhatsappPhone(input: string | null | undefined): WhatsappPhoneValidation {
  const trimmed = (input ?? '').trim()
  if (!trimmed) {
    return { valid: false, reason: 'empty', message: 'Saisissez un numéro WhatsApp.' }
  }
  const digits = trimmed.replace(/[^0-9]/g, '')
  if (digits.length === 0) {
    return {
      valid: false,
      reason: 'non_digits_only',
      message: 'Le numéro doit contenir des chiffres (ex : 237699112233).',
    }
  }
  if (digits.length < MIN_DIGITS) {
    return {
      valid: false,
      reason: 'too_short',
      message: `Trop court (${digits.length} chiffres) — minimum ${MIN_DIGITS} avec l'indicatif pays.`,
    }
  }
  if (digits.length > MAX_DIGITS) {
    return {
      valid: false,
      reason: 'too_long',
      message: `Trop long (${digits.length} chiffres) — maximum ${MAX_DIGITS}.`,
    }
  }
  if (digits.startsWith('0')) {
    return {
      valid: false,
      reason: 'leading_zero',
      message: "Saisissez le numéro au format international (sans le 0). Ex : 237699112233 pour le Cameroun, 33612345678 pour la France.",
    }
  }
  return { valid: true, normalized: digits }
}

/**
 * Build a wa.me URL. Returns `null` when the phone fails validation so
 * callers can decide whether to hide the CTA entirely (preferred behavior
 * — a dead link is worse than no link).
 */
export function buildWhatsappUrl(phone: string | null | undefined, message: string): string | null {
  const result = validateWhatsappPhone(phone)
  if (!result.valid) return null
  const text = encodeURIComponent(message)
  return `https://wa.me/${result.normalized}?text=${text}`
}

interface MessageContext {
  merchantName?: string | null
  commerceName?: string | null
  productName?: string | null
  customerName?: string | null
}

/**
 * Compose the pre-filled message shown to the merchant. Mirrors the example
 * the product owner asked for:
 *   "Bonjour <Nom>, j'ai trouvé votre cuisine sur TchopMyGrinds, je voudrais
 *    commander <produit>."
 *
 * Greeting target priority: merchantName > commerceName > generic "Bonjour,".
 * Shop reference avoids echoing the same name twice — if the greeting already
 * used the commerce name, the reference falls back to "votre commerce".
 */
export function composeWhatsappMessage(ctx: MessageContext): string {
  const merchant = ctx.merchantName?.trim()
  const commerce = ctx.commerceName?.trim()

  const greetTarget = merchant || commerce || ''
  const hello = greetTarget ? `Bonjour ${greetTarget},` : 'Bonjour,'

  // Avoid the awkward "Bonjour épicerie X, j'ai trouvé épicerie X" duplication.
  // If the greeting already named the commerce, the shop reference stays generic.
  const shopRef = commerce && commerce !== greetTarget
    ? `j'ai trouvé ${commerce} sur TchopMyGrinds`
    : "j'ai trouvé votre commerce sur TchopMyGrinds"

  const intent = ctx.productName?.trim()
    ? `je voudrais commander « ${ctx.productName.trim()} ».`
    : 'je voudrais passer commande.'
  const signature = ctx.customerName?.trim() ? `\n\n— ${ctx.customerName.trim()}` : ''
  return `${hello} ${shopRef}, ${intent}${signature}`
}
