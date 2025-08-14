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

ActiveRecord::Schema[7.1].define(version: 2024_12_10_120000) do
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
    t.index ["user_id"], name: "index_commerces_on_user_id"
  end

  create_table "commerces_products", id: false, force: :cascade do |t|
    t.integer "commerce_id", null: false
    t.integer "product_id", null: false
    t.index ["commerce_id", "product_id"], name: "index_commerces_products_on_commerce_id_and_product_id"
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
    t.index ["commerce_id"], name: "index_products_on_commerce_id"
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
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "addresses", "users"
  add_foreign_key "commerces", "users"
  add_foreign_key "orderdetails", "orders"
  add_foreign_key "orderdetails", "products"
  add_foreign_key "orders", "users"
  add_foreign_key "product_interests", "users"
  add_foreign_key "products", "commerces"
end
