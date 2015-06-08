class AddServerTypeToServer < ActiveRecord::Migration
  def change
    add_column :servers, :server_type, :string, default: 'prometheus'
  end
end
