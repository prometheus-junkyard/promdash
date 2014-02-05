class SingleWidgetController < ApplicationController
  def show
    @servers = Server.all
    render layout: 'single_widget'
  end
end
