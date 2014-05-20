class AddDirectories < ActiveRecord::Migration
  def change
    create_table :directories do |t|
      t.string :name

      t.timestamps
    end
  end
end
