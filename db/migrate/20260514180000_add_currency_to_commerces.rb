class AddCurrencyToCommerces < ActiveRecord::Migration[7.1]
  # ISO-4217 currency code displayed alongside product prices for this shop.
  # We keep "EUR" as the default to preserve current UI behavior — every
  # existing row was rendered with "€" hardcoded. New Cameroun-based shops
  # can pick "XAF" at creation. Add other codes here when a real market needs them.
  ALLOWED = %w[EUR XAF].freeze

  def change
    add_column :commerces, :currency, :string, null: false, default: "EUR", limit: 3
    add_index :commerces, :currency
  end
end
