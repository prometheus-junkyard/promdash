class EmbedController < ApplicationController
  after_action :allow_iframe, only: :show
  before_action :set_dashboard_via_slug, only: :show

  def show
    @servers = Server.all
    render layout: 'single_widget'
  end
end
