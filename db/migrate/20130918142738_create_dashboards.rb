class CreateDashboards < ActiveRecord::Migration
  def change
    create_table :dashboards do |t|
      t.string :name
      t.text :graphs_json, default: '{}'

      t.timestamps
    end
  end
end
