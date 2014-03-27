class ShortenedUrl < ActiveRecord::Base
  def self.create_with_last_accessed params
    shortened_url = new encoded_url: params[:encoded_url], last_accessed: Time.now
    shortened_url.save!
    shortened_url
  end

  def update_last_accessed
    update_attribute :last_accessed, Time.now
  end
end
