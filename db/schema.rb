# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_03_06_044940) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "addresses", force: :cascade do |t|
    t.bigint "user_id"
    t.text "address1"
    t.text "address2"
    t.text "city"
    t.text "state"
    t.text "country"
    t.text "zipcode"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.float "latitude"
    t.float "longitude"
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

  create_table "categorizations", force: :cascade do |t|
    t.integer "product_id"
    t.integer "commerce_id"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "city"
    t.bigint "user_id"
    t.index ["user_id"], name: "index_commerces_on_user_id"
  end

  create_table "commerces_products", id: false, force: :cascade do |t|
    t.integer "commerce_id", null: false
    t.integer "product_id", null: false
    t.index ["commerce_id", "product_id"], name: "index_commerces_products_on_commerce_id_and_product_id"
  end

  create_table "orderdetails", force: :cascade do |t|
    t.decimal "UnitPrice", precision: 8, scale: 2
    t.integer "Quantity", default: 1
    t.decimal "Discount", precision: 8, default: "0"
    t.integer "product_id"
    t.integer "order_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_orderdetails_on_order_id"
    t.index ["product_id"], name: "index_orderdetails_on_product_id"
  end

  create_table "orders", force: :cascade do |t|
    t.date "OrderDate"
    t.date "requiredate"
    t.datetime "shippedate"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "status"
    t.integer "payment_address_id"
    t.integer "delivery_address_id"
    t.index ["delivery_address_id"], name: "index_orders_on_delivery_address_id"
    t.index ["payment_address_id"], name: "index_orders_on_payment_address_id"
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
end
