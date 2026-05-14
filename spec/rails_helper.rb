# This file is loaded by specs that need Rails. Keep slow setup here.
require 'spec_helper'

ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../config/environment', __dir__)

# Abort if rails detects pending migrations (only matters once migrations
# stabilize; remove the rescue once schema is reliable on dev machines).
abort('The Rails environment is running in production mode!') if Rails.env.production?

require 'rspec/rails'

# Auto-load support files (factories, shared examples, etc.)
Dir[Rails.root.join('spec/support/**/*.rb')].sort.each { |f| require f }

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  warn "Pending migration: #{e.message}"
end

RSpec.configure do |config|
  if config.respond_to?(:fixture_paths=)
    config.fixture_paths = [Rails.root.join('spec/fixtures').to_s]
  elsif config.respond_to?(:fixture_path=)
    config.fixture_path = Rails.root.join('spec/fixtures').to_s
  end
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  # Allow `create`/`build` instead of `FactoryBot.create`/`FactoryBot.build`.
  config.include FactoryBot::Syntax::Methods

  # The currency seed lives inside the `create_currencies` migration, which
  # `maintain_test_schema!` does NOT replay. Re-seed once per suite so any
  # spec that touches Commerce#currency or hits /api/v1/currencies has the
  # registry populated. Idempotent — find_or_create_by guards re-runs.
  config.before(:suite) do
    [
      { code: 'EUR', label: '€ Euro (zone euro)', decimals: 2, suffix: '€' },
      { code: 'XAF', label: 'FCFA Franc CFA (Cameroun, Tchad, Congo…)', decimals: 0, suffix: 'FCFA' },
      { code: 'ETB', label: 'Br Birr éthiopien (Éthiopie)', decimals: 2, suffix: 'Br' },
    ].each do |attrs|
      Currency.find_or_create_by!(code: attrs[:code]) do |c|
        c.label = attrs[:label]
        c.decimals = attrs[:decimals]
        c.suffix = attrs[:suffix]
      end
    end
  end
end
