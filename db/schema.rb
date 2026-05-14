# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_05_14_210000) do
  create_table "addresses", force: :cascade do |t|
    t.integer "user_id"
    t.text "address1"
    t.text "address2"
    t.text "city"
    t.text "state"
    t.text "country"
    t.text "zipcode"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.float "latitude"
    t.float "longitude"
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

  create_table "categorizations", force: :cascade do |t|
    t.integer "product_id"
    t.integer "commerce_id"
    t.integer "position"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["product_id", "commerce_id"], name: "index_categorizations_on_product_id_and_commerce_id"
  end

  create_table "commerces", force: :cascade do |t|
    t.string "name"
    t.string "adress1"
    t.string "adress2"
    t.string "details"
    t.string "postal"
    t.string "country"
    t.float "latitude"
    t.float "longitude"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "city"
    t.integer "user_id"
    t.decimal "rating", precision: 3, scale: 2, default: "0.0"
    t.integer "rating_count", default: 0
    t.boolean "verified", default: false
    t.string "category"
    t.string "phone"
    t.string "website"
    t.text "opening_hours"
    t.string "image_url"
    t.boolean "is_online", default: false, null: false
    t.datetime "location_updated_at"
    t.text "search_text"
    t.string "currency", limit: 3, default: "EUR", null: false
    t.index ["category"], name: "index_commerces_on_category"
    t.index ["currency"], name: "index_commerces_on_currency"
    t.index ["is_online"], name: "index_commerces_on_is_online"
    t.index ["location_updated_at"], name: "index_commerces_on_location_updated_at"
    t.index ["rating"], name: "index_commerces_on_rating"
    t.index ["search_text"], name: "index_commerces_on_search_text"
    t.index ["user_id"], name: "index_commerces_on_user_id"
    t.index ["verified"], name: "index_commerces_on_verified"
  end

  create_table "commerces_products", id: false, force: :cascade do |t|
    t.integer "commerce_id", null: false
    t.integer "product_id", null: false
    t.index ["commerce_id", "product_id"], name: "index_commerces_products_on_commerce_id_and_product_id"
  end

  create_table "currencies", primary_key: "code", id: { type: :string, limit: 3 }, force: :cascade do |t|
    t.string "label", null: false
    t.integer "decimals", default: 2, null: false
    t.string "suffix", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "favorites", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "commerce_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["commerce_id"], name: "index_favorites_on_commerce_id"
    t.index ["user_id", "commerce_id"], name: "index_favorites_on_user_id_and_commerce_id", unique: true
    t.index ["user_id"], name: "index_favorites_on_user_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.string "jti"
    t.datetime "exp"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti"
  end

  create_table "messages", force: :cascade do |t|
    t.integer "sender_id", null: false
    t.integer "receiver_id", null: false
    t.text "content", null: false
    t.string "subject"
    t.datetime "read_at"
    t.string "conversation_id", null: false
    t.integer "message_type", default: 0
    t.integer "product_id"
    t.integer "commerce_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["commerce_id"], name: "index_messages_on_commerce_id"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["created_at"], name: "index_messages_on_created_at"
    t.index ["product_id"], name: "index_messages_on_product_id"
    t.index ["read_at"], name: "index_messages_on_read_at"
    t.index ["receiver_id"], name: "index_messages_on_receiver_id"
    t.index ["sender_id", "receiver_id"], name: "index_messages_on_sender_id_and_receiver_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "newsletters", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "orderdetails", force: :cascade do |t|
    t.decimal "unitprice", precision: 8, scale: 2
    t.integer "quantity", default: 1
    t.decimal "discount", precision: 8, default: "0"
    t.integer "product_id"
    t.integer "order_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["order_id"], name: "index_orderdetails_on_order_id"
    t.index ["product_id"], name: "index_orderdetails_on_product_id"
  end

  create_table "orders", force: :cascade do |t|
    t.date "orderdate"
    t.date "requiredate"
    t.datetime "shippedate", precision: nil
    t.integer "user_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "status"
    t.decimal "total_amount", precision: 10, scale: 2
    t.string "delivery_address"
    t.string "phone"
    t.text "notes"
    t.string "payment_method"
    t.decimal "delivery_fee", precision: 10, scale: 2, default: "0.0", null: false
    t.index ["total_amount"], name: "index_orders_on_total_amount"
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "product_interests", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "product_name", null: false
    t.decimal "user_latitude", precision: 10, scale: 6, null: false
    t.decimal "user_longitude", precision: 10, scale: 6, null: false
    t.integer "search_radius", default: 25
    t.text "message"
    t.boolean "fulfilled", default: false
    t.datetime "fulfilled_at", precision: nil
    t.boolean "email_sent", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_product_interests_on_created_at"
    t.index ["fulfilled", "product_name", "created_at"], name: "idx_interests_fulfilled_name_date"
    t.index ["fulfilled"], name: "index_product_interests_on_fulfilled"
    t.index ["product_name"], name: "index_product_interests_on_product_name"
    t.index ["user_id"], name: "index_product_interests_on_user_id"
    t.index ["user_latitude", "user_longitude"], name: "index_product_interests_on_user_latitude_and_user_longitude"
  end

  create_table "products", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "quantityperunit"
    t.decimal "unitprice", precision: 10, scale: 2
    t.integer "unitsinstock", default: 0
    t.integer "unitsonorder", default: 0
    t.integer "reorderlevel", default: 0
    t.boolean "discontinued", default: false
    t.integer "commerce_id"
    t.string "category"
    t.text "description"
    t.string "image_url"
    t.boolean "available", default: true
    t.text "search_text"
    t.index ["available"], name: "index_products_on_available"
    t.index ["category"], name: "index_products_on_category"
    t.index ["commerce_id"], name: "index_products_on_commerce_id"
    t.index ["search_text"], name: "index_products_on_search_text"
  end

  create_table "rating_votes", force: :cascade do |t|
    t.integer "rating_id", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["rating_id"], name: "index_rating_votes_on_rating_id"
    t.index ["user_id", "rating_id"], name: "index_rating_votes_on_user_id_and_rating_id", unique: true
    t.index ["user_id"], name: "index_rating_votes_on_user_id"
  end

  create_table "ratings", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "rateable_type", null: false
    t.integer "rateable_id", null: false
    t.integer "rating", null: false
    t.text "comment"
    t.boolean "verified", default: false
    t.boolean "moderated", default: false
    t.integer "helpful_count", default: 0
    t.integer "order_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "moderated_at"
    t.integer "moderated_by"
    t.integer "status", default: 0
    t.index ["moderated"], name: "index_ratings_on_moderated"
    t.index ["moderated_at"], name: "index_ratings_on_moderated_at"
    t.index ["moderated_by"], name: "index_ratings_on_moderated_by"
    t.index ["order_id"], name: "index_ratings_on_order_id"
    t.index ["rateable_type", "rateable_id"], name: "index_ratings_on_rateable"
    t.index ["rateable_type", "rateable_id"], name: "index_ratings_on_rateable_type_and_rateable_id"
    t.index ["rating"], name: "index_ratings_on_rating"
    t.index ["status"], name: "index_ratings_on_status"
    t.index ["user_id", "rateable_type", "rateable_id"], name: "index_ratings_unique_per_user", unique: true
    t.index ["user_id"], name: "index_ratings_on_user_id"
    t.index ["verified"], name: "index_ratings_on_verified"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at", precision: nil
    t.datetime "remember_created_at", precision: nil
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at", precision: nil
    t.datetime "last_sign_in_at", precision: nil
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "name"
    t.boolean "admin", default: false
    t.boolean "seller_role", default: false
    t.boolean "buyer_role", default: false
    t.integer "statut_type"
    t.string "phone"
    t.string "avatar_url"
    t.string "whatsapp_phone"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["phone"], name: "index_users_on_phone"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "addresses", "users"
  add_foreign_key "commerces", "users"
  add_foreign_key "favorites", "commerces"
  add_foreign_key "favorites", "users"
  add_foreign_key "messages", "commerces"
  add_foreign_key "messages", "products"
  add_foreign_key "messages", "users", column: "receiver_id"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "orderdetails", "orders"
  add_foreign_key "orderdetails", "products"
  add_foreign_key "orders", "users"
  add_foreign_key "product_interests", "users"
  add_foreign_key "products", "commerces"
  add_foreign_key "rating_votes", "ratings"
  add_foreign_key "rating_votes", "users"
  add_foreign_key "ratings", "orders"
  add_foreign_key "ratings", "users"
end
