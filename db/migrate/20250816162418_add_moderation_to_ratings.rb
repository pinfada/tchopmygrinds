class AddModerationToRatings < ActiveRecord::Migration[7.1]
  def change
    add_column :ratings, :moderated_at, :datetime
    add_column :ratings, :moderated_by, :integer
    add_column :ratings, :status, :integer, default: 0
    
    add_index :ratings, :status
    add_index :ratings, :moderated_by
    add_index :ratings, :moderated_at
  end
end
