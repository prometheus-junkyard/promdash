class SingleWidgetController < ApplicationController
  after_action :allow_iframe, only: :show

  def show
    shortened_url = ShortenedUrl.find_by_slug(params[:slug])
    shortened_url.update_last_accessed
    @blob = shortened_url.encoded_url
    @servers = Server.all
    render layout: 'single_widget'
  end

  def create
    shortened_url = ShortenedUrl.create_with_last_accessed params
    render json: {id: shortened_url.slug}
  end
end
