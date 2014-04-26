# encoding: UTF-8
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

ActiveRecord::Schema.define(version: 20140413155227) do

  create_table "dashboards", force: true do |t|
    t.string   "name"
    t.text     "dashboard_json"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "slug"
  end

  create_table "servers", force: true do |t|
    t.string   "name"
    t.string   "url"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "shortened_urls", force: true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "encoded_url"
    t.datetime "last_accessed"
    t.string   "checksum",      limit: 32, default: "", null: false
    t.integer  "dashboard_id"
  end

  add_index "shortened_urls", ["checksum"], name: "index_shortened_urls_on_checksum", unique: true, using: :btree

end
