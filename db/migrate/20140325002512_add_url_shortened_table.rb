class AddUrlShortenedTable < ActiveRecord::Migration
  def change
    create_table :shortened_urls do |t|
      t.timestamps
      t.string :encoded_url
      t.timestamp :last_accessed
    end
  end
end
