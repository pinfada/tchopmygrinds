class CreateCurrencies < ActiveRecord::Migration[7.1]
  def change
    create_table :currencies, id: false do |t|
      # ISO-4217 code (3 letters). Used as the natural primary key so foreign
      # references stay human-readable ("commerces.currency = 'EUR'") and the
      # migration to a normalized FK constraint is straightforward later.
      t.string :code, primary_key: true, limit: 3, null: false
      # Long-form label used in dropdowns, e.g. "€ Euro (zone euro)".
      t.string :label, null: false
      # 0 for currencies without a minor unit (XAF, JPY); 2 for most others.
      t.integer :decimals, null: false, default: 2
      # Suffix appended after the formatted amount in the UI: "€", "FCFA", "Br".
      t.string :suffix, null: false
      t.timestamps
    end

    # Seed the three currencies we already support. Inline so the schema
    # bootstrap of a fresh dev DB produces a functional registry without
    # depending on a separate seed script.
    reversible do |dir|
      dir.up do
        execute <<~SQL
          INSERT INTO currencies (code, label, decimals, suffix, created_at, updated_at) VALUES
            ('EUR', '€ Euro (zone euro)', 2, '€', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('XAF', 'FCFA Franc CFA (Cameroun, Tchad, Congo…)', 0, 'FCFA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('ETB', 'Br Birr éthiopien (Éthiopie)', 2, 'Br', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        SQL
      end
    end
  end
end
