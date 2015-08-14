class DashboardSlugUniquenessConstraint < ActiveRecord::Migration
  def change
    add_index :dashboards, :slug, unique: true
  end
end
