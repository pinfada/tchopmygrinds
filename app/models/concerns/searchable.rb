module Searchable
  extend ActiveSupport::Concern

  # Strip accents (NFKD + drop combining marks) and lowercase. The result is
  # what tokenized_search matches against, so the buyer can type "mure" and
  # still find "Bananes plantain mûres" — and vice-versa.
  def self.normalize(value)
    value.to_s.unicode_normalize(:nfkd).gsub(/\p{Mn}+/, "").downcase
  end

  included do
    before_save :update_search_text
  end

  class_methods do
    # The model declares which columns participate. Strings only; nil-safe.
    def searchable_fields(*names)
      @searchable_fields = names.map(&:to_sym)
    end

    def searchable_field_names
      @searchable_fields || []
    end
  end

  private

  def update_search_text
    fields = self.class.searchable_field_names
    return if fields.empty?

    self.search_text = fields
      .map { |f| respond_to?(f) ? Searchable.normalize(send(f)) : "" }
      .reject(&:blank?)
      .join(" ")
  end
end
