class ChangeEncodedUrlColumnType < ActiveRecord::Migration
  def self.up
    change_table :shortened_urls do |t|
      t.change :encoded_url, :text
    end
  end
  def self.down
    change_table :shortened_urls do |t|
      t.change :encoded_url, :string
    end
  end
end
