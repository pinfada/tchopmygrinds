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

ActiveRecord::Schema.define(version: 20170208141518) do

  create_table "categorizations", force: :cascade do |t|
    t.integer  "product_id"
    t.integer  "commerce_id"
    t.integer  "position"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["product_id", "commerce_id"], name: "index_categorizations_on_product_id_and_commerce_id"
  end

  create_table "commerces", force: :cascade do |t|
    t.string   "name"
    t.string   "adress1"
    t.string   "adress2"
    t.string   "details"
    t.string   "postal"
    t.string   "country"
    t.float    "latitude"
    t.float    "longitude"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "city"
  end

  create_table "commerces_products", id: false, force: :cascade do |t|
    t.integer "commerce_id", null: false
    t.integer "product_id",  null: false
    t.index ["commerce_id", "product_id"], name: "index_commerces_products_on_commerce_id_and_product_id"
  end

  create_table "products", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
