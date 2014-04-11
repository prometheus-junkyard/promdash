class DashboardsController < ApplicationController
  before_action :set_dashboard, only: [:edit, :destroy, :widgets, :clone]
  before_action :set_dashboard_via_slug, only: [:show, :update]

  # GET /dashboards
  # GET /dashboards.json
  def index
    @dashboards = Dashboard.alphabetical
    if params[:filter] == "cloneable"
      @dashboards = @dashboards.cloneable
    end
    respond_to do |format|
      format.html { render 'index' }
      format.json { render json: @dashboards }
    end
  end

  # GET /dashboards/1
  # GET /dashboards/1.json
  def show
    @servers = Server.order("lower(name)")
  end

  # GET /dashboards/new
  def new
    @dashboard = Dashboard.new
  end

  # GET /dashboards/1/edit
  def edit
  end

  def clone
    @source_id = @dashboard.id
    @dashboard = @dashboard.make_clone
    render 'new'
  end

  # POST /dashboards
  # POST /dashboards.json
  def create
    @dashboard = Dashboard.new_with_slug(dashboard_params)
    if params[:source_id].present?
      @dashboard.dashboard_json = Dashboard.find(params[:source_id]).dashboard_json
    end

    respond_to do |format|
      if @dashboard.save
        format.html { redirect_to dashboard_slug_path(@dashboard.slug), notice: 'Dashboard was successfully created.' }
        format.json { render action: 'show', status: :created, location: @dashboard }
      else
        format.html { render action: 'new' }
        format.json { render json: @dashboard.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /dashboards/1
  # PATCH/PUT /dashboards/1.json
  def update
    respond_to do |format|
      if @dashboard.update(dashboard_params)
        format.html { redirect_to dashboard_slug_path(@dashboard.slug), notice: 'Dashboard was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @dashboard.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /dashboards/1
  # DELETE /dashboards/1.json
  def destroy
    @dashboard.destroy
    respond_to do |format|
      format.html { redirect_to dashboards_url }
      format.json { head :no_content }
    end
  end

  def widgets
    render json: @dashboard.widgets
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_dashboard
    @dashboard = Dashboard.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def dashboard_params
    params.require(:dashboard).permit(:name, :dashboard_json, :slug)
  end
end
