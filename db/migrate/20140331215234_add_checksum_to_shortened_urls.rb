class AddChecksumToShortenedUrls < ActiveRecord::Migration
  def change
    change_table :shortened_urls do |t|
      t.string :checksum, limit: 32, null: false, default: ''
      t.index :checksum, unique: true
    end

    if defined?(ShortenedUrl)
      ShortenedUrl.all.each do |url|
        url.checksum = ShortenedUrl.checksum(url.encoded_url)

        begin
          url.save!
        rescue ActiveRecord::StatementInvalid
          # duplicate
          url.destroy
        end
      end
    end
  end
end
