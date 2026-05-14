class AddSearchTextToProductsAndCommerces < ActiveRecord::Migration[7.1]
  def change
    # Lowercased + accent-stripped concatenation of the searchable fields.
    # Kept up to date by a before_save callback on each model. Indexed so
    # tokenized_search stays fast as the catalog grows.
    add_column :products, :search_text, :text
    add_index :products, :search_text

    add_column :commerces, :search_text, :text
    add_index :commerces, :search_text
  end
end
