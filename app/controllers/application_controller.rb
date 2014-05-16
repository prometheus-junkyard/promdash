class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  after_filter :set_csrf_cookie_for_ng

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  def record_not_found
    raise ActionController::RoutingError.new('This record was not found')
  end

  private
  # By default, Rails 4 sets the X-Frame-Options header to 'SAMEORIGIN'. Using
  # this method as an after_action allows external iframes to access those
  # routes.
  # http://stackoverflow.com/questions/18445782/how-to-override-x-frame-options-for-a-controller-or-action-in-rails-4
  def allow_iframe
    response.headers.except! 'X-Frame-Options'
  end

  def set_dashboard_via_slug
    unless @dashboard = Dashboard.find_by_slug(params[:slug]) || Dashboard.find_by_id(params[:id])
      record_not_found
    end
  end

  protected
  def verified_request?
    super || form_authenticity_token == request.headers['X-XSRF-TOKEN']
  end
end
