class AddPermalinkAttrToDashboards < ActiveRecord::Migration
  def change
    add_column :dashboards, :permalink, :boolean, default: false
  end
end
