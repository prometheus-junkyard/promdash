require 'slug_maker'

class ShortenedUrl < ActiveRecord::Base
  def self.create_with_last_accessed params
    shortened_url = new encoded_url: params[:encoded_url], last_accessed: Time.now
    shortened_url.save!
    shortened_url.set_slug params[:dashboard_name], params[:graph_title]
    shortened_url
  end

  def set_slug dashboard_name, graph_title
    update_attribute :slug, SlugMaker.slug("#{id} #{dashboard_name} #{graph_title}")
  end

  def update_last_accessed
    update_attribute :last_accessed, Time.now
  end
end
