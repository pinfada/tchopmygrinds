require 'rails_helper'

RSpec.describe Currency, type: :model do
  describe 'validations' do
    it 'requires a 3-letter uppercase ISO code' do
      # 'EUR' is already seeded by the suite, so the uniqueness validator
      # would mask the format check. Use an unused 3-letter code instead.
      expect(Currency.new(code: '', label: 'X', decimals: 2, suffix: 'X')).to be_invalid
      expect(Currency.new(code: 'qa', label: 'X', decimals: 2, suffix: 'X')).to be_invalid # too short / lowercase
      expect(Currency.new(code: 'XYZA', label: 'X', decimals: 2, suffix: 'X')).to be_invalid # too long
      expect(Currency.new(code: 'XY2', label: 'X', decimals: 2, suffix: 'X')).to be_invalid # contains a digit
      expect(Currency.new(code: 'XYZ', label: 'X', decimals: 2, suffix: 'X')).to be_valid
    end

    it 'normalizes the code to upper-case on save' do
      c = Currency.new(code: ' eur ', label: 'Euro', decimals: 2, suffix: '€')
      c.valid?
      expect(c.code).to eq('EUR')
    end

    it 'requires label and suffix' do
      expect(Currency.new(code: 'XYZ', label: '', decimals: 2, suffix: 'X')).to be_invalid
      expect(Currency.new(code: 'XYZ', label: 'Y', decimals: 2, suffix: '')).to be_invalid
    end

    it 'restricts decimals to 0..4 integer' do
      expect(Currency.new(code: 'XYZ', label: 'Y', decimals: -1, suffix: 'X')).to be_invalid
      expect(Currency.new(code: 'XYZ', label: 'Y', decimals: 5, suffix: 'X')).to be_invalid
      expect(Currency.new(code: 'XYZ', label: 'Y', decimals: 1.5, suffix: 'X')).to be_invalid
      expect(Currency.new(code: 'XYZ', label: 'Y', decimals: 0, suffix: 'X')).to be_valid
      expect(Currency.new(code: 'XYZ', label: 'Y', decimals: 2, suffix: 'X')).to be_valid
    end
  end

  describe '.codes' do
    it 'returns the seeded codes' do
      # spec/rails_helper.rb seeds EUR/XAF/ETB before the suite — schema.rb
      # creates the table empty, so we re-seed manually for the test env.
      expect(Currency.codes).to include('EUR', 'XAF', 'ETB')
    end

    it 'reflects newly created codes' do
      Currency.create!(code: 'TST', label: 'Test', decimals: 0, suffix: 'T')
      expect(Currency.codes).to include('TST')
    end

    it 'busts its Rails.cache key on commit', :memory_cache do
      # The test env defaults to :null_store, which short-circuits caching.
      # Swap to a real memory store just for this case so we can observe the
      # cache invalidation contract end-to-end.
      original = Rails.cache
      Rails.cache = ActiveSupport::Cache::MemoryStore.new

      Currency.codes # prime the cache
      expect(Rails.cache.read(Currency::CACHE_KEY)).to be_an(Array)

      Currency.create!(code: 'TSS', label: 'Test 2', decimals: 0, suffix: 'T')
      expect(Rails.cache.read(Currency::CACHE_KEY)).to be_nil

      Currency.find_by(code: 'TSS').destroy
      expect(Rails.cache.read(Currency::CACHE_KEY)).to be_nil
    ensure
      Rails.cache = original
    end
  end
end
