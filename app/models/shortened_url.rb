require 'digest/md5'

class ShortenedUrl < ActiveRecord::Base
  belongs_to :dashboard
  def self.create_from_encoded_url encoded_url
    find_or_create_by!(checksum: checksum(encoded_url)) do |url|
      url.encoded_url = encoded_url
    end
  end

  def self.checksum(string)
    Digest::MD5.hexdigest(string)
  end

  def update_last_accessed
    update_attribute :last_accessed, Time.now
  end
end
