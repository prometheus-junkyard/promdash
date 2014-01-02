class ChangeGraphsJsonToDashboardJson < ActiveRecord::Migration
  def change
    rename_column :dashboards, :graphs_json, :dashboard_json
  end
end
