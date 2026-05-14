class Currency < ApplicationRecord
  # `code` is the natural primary key (ISO-4217). See db/migrate/.../create_currencies.rb.
  self.primary_key = :code

  CACHE_KEY = 'currencies/codes'.freeze

  # All-caps 3-letter ISO codes. Locked early so callers don't have to upcase
  # everywhere — the UI may send "eur" if user toggled it.
  before_validation :normalize_code

  validates :code, presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: /\A[A-Z]{3}\z/, message: "doit être un code ISO-4217 (3 lettres majuscules)" }
  validates :label, presence: true
  validates :decimals, presence: true, numericality: { only_integer: true, in: 0..4 }
  validates :suffix, presence: true

  # Bust the memoized code list whenever the table changes. We don't have a
  # strict freshness requirement (a cold-cache miss on Commerce save just
  # rebuilds from a 3-5 row SELECT), so an after_commit hook is fine.
  after_commit :clear_codes_cache

  # Memoized list of valid codes for the Commerce inclusion validator. The
  # cache-store TTL (1 hour) is a backstop — `after_commit` invalidates it
  # on any Currency mutation. Reads stay sub-millisecond regardless of how
  # many Commerce saves happen.
  def self.codes
    Rails.cache.fetch(CACHE_KEY, expires_in: 1.hour) do
      pluck(:code).sort
    end
  end

  private

  def normalize_code
    self.code = code.to_s.strip.upcase if code.is_a?(String)
  end

  def clear_codes_cache
    Rails.cache.delete(CACHE_KEY)
  end
end
