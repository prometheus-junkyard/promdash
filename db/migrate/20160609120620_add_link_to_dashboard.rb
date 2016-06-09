class AddLinkToDashboard < ActiveRecord::Migration
  def change
    add_column :dashboards, :link, :string, default: "", null: false
  end
end
