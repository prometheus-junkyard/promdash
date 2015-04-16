class CreateProfiles < ActiveRecord::Migration
  def change
    create_table :profiles do |t|
      t.string :name
      t.text :variables
      t.belongs_to :dashboard, index: true

      t.timestamps
    end
  end
end
