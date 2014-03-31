require 'digest/md5'

class ShortenedUrl < ActiveRecord::Base
  def self.create_with_last_accessed params
    find_or_create_by!(checksum: checksum(params[:encoded_url])) do |url|
      url.encoded_url = params[:encoded_url]
      url.last_accessed = Time.now
    end
  end

  def self.checksum(string)
    Digest::MD5.hexdigest(string)
  end

  def update_last_accessed
    update_attribute :last_accessed, Time.now
  end
end
