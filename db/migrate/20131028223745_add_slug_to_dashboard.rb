class AddSlugToDashboard < ActiveRecord::Migration
  def change
    add_column :dashboards, :slug, :string
  end
end
