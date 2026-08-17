class Currency < ApplicationRecord
  # `code` is the natural primary key (ISO-4217). See db/migrate/.../create_currencies.rb.
  self.primary_key = :code

  CACHE_KEY = 'currencies/codes'.freeze

  # Registre de référence, tenu en Ruby et pas seulement dans la migration qui
  # a créé la table. `db/schema.rb` décrit une structure, jamais des lignes :
  # toute base montée par `db:schema:load` — le chemin emprunté par
  # `db:prepare` et `db:setup` sur une base vide — obtient donc la table
  # `currencies` SANS aucune devise. `Currency.codes` renvoie alors `[]` et la
  # validation d'inclusion de Commerce rejette tout, y compris "EUR".
  CANONICAL = [
    { code: 'EUR', label: '€ Euro (zone euro)',                        decimals: 2, suffix: '€' },
    { code: 'XAF', label: 'FCFA Franc CFA (Cameroun, Tchad, Congo…)',  decimals: 0, suffix: 'FCFA' },
    { code: 'ETB', label: 'Br Birr éthiopien (Éthiopie)',              decimals: 2, suffix: 'Br' }
  ].freeze

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

  # Garantit que le registre contient au moins les devises de CANONICAL.
  # Idempotent : appelable sur une base déjà peuplée comme sur une base vierge.
  # Les lignes existantes ne sont PAS écrasées — un opérateur qui a retouché un
  # libellé le conserve. Le cache est invalidé explicitement : sans création,
  # aucun `after_commit` ne se déclenche et un `[]` mémorisé plus tôt dans le
  # même processus survivrait à l'amorçage.
  def self.bootstrap!
    CANONICAL.each do |attributes|
      find_or_create_by!(code: attributes[:code]) do |currency|
        currency.label    = attributes[:label]
        currency.decimals = attributes[:decimals]
        currency.suffix   = attributes[:suffix]
      end
    end

    Rails.cache.delete(CACHE_KEY)
    self
  end

  private

  def normalize_code
    self.code = code.to_s.strip.upcase if code.is_a?(String)
  end

  def clear_codes_cache
    Rails.cache.delete(CACHE_KEY)
  end
end
