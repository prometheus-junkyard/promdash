require 'slug_maker'

class SingleWidgetController < ApplicationController
  def show
    shortened_url = ShortenedUrl.find(params[:slug])
    shortened_url.update_last_accessed
    @title = params[:slug].split("-")[1..-1].join(" ")
    @dashboard = shortened_url.dashboard
    @blob = shortened_url.encoded_url
    @servers = Server.all
    @dashboard_profile = params[:profile]
    render layout: 'single_widget'
  end

  def create
    dashboard = Dashboard.find_by_name params[:dashboard_name]
    shortened_url = dashboard.shortened_urls.create_from_encoded_url params[:encoded_url]
    payload = {
      id: SlugMaker.slug("#{shortened_url.id} #{params[:dashboard_name]} #{params[:graph_title]}")
    }
    render json: payload
  end
end
