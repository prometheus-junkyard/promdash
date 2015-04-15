class AddSlugsToProfiles < ActiveRecord::Migration
  def change
    add_column :profiles, :slug, :string
  end
end
