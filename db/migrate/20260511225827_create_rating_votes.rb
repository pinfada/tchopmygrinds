class CreateRatingVotes < ActiveRecord::Migration[7.1]
  def change
    create_table :rating_votes do |t|
      t.references :rating, null: false, foreign_key: true
      t.references :user,   null: false, foreign_key: true

      t.timestamps
    end

    # One vote per (user, rating) pair. This is the database-level guarantee
    # that prevents `helpful_count` inflation by repeated POSTs.
    add_index :rating_votes, [:user_id, :rating_id], unique: true
  end
end
