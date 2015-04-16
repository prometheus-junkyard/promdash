class AddTypesToDashboards < ActiveRecord::Migration
  def change
    add_column :dashboards, :dashboard_type, :string, default: "standalone"
  end
end
