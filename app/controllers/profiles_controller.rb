class ProfilesController < ApplicationController
  before_action :set_templates, only: [:index, :new, :edit]
  before_action :set_profile, only: [:show, :edit, :update, :destroy]
  before_action :set_template_variables, only: [:new, :edit, :show]
  before_action :set_dashboard_via_slug, only: :show

  def index
    respond_to do |format|
      format.html { render 'index' }
      format.json { render json: @templates }
    end
  end

  def show
    # TODO: do something better. Maybe make a transient dashboard with the
    # migrator or something.
    p = Profile.find_by_slug(params[:profile_slug])
    vars = JSON.parse(p.variables || '{}')
    json = JSON.parse(@dashboard.dashboard_json)
    json['globalConfig']['vars'].merge!(@template_variables)
    @dashboard.dashboard_json = json.to_json
    @dashboard.name = p.name
    @servers = Server.order("lower(name)")
    render 'dashboards/show'
  end

  def new
    @profile = Profile.new
  end

  def edit
    @profile = Profile.find(params[:id])
  end

  def create
    @profile = Profile.new_with_slug(profile_params)

    respond_to do |format|
      if @profile.save
        format.html { redirect_to profile_slug_path(@profile), notice: 'Profile was successfully created.' }
        format.json { render action: 'show', status: :created, location: @profile }
      else
        format.html do
          render action: 'new'
        end
        format.json { render json: @profile.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @profile.update(profile_params)
        format.html { redirect_to profile_slug_path(@profile), notice: 'Profile was successfully updated.' }
        format.json { head :no_content }
      else
        format.html do
          render action: 'edit'
        end
        format.json { render json: @profile.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @profile.destroy
    respond_to do |format|
      format.html { redirect_to root_path }
      format.json { head :no_content }
    end
  end

  private
  def set_profile
    @profile = Profile.find_by_slug(params[:profile_slug]) || Profile.find(params[:id])
  end

  def set_templates
    @templates = Dashboard.template.alphabetical.includes(:profiles)
  end

  def set_template_variables
    p = @profile || Profile.new
    @template_variables = JSON.parse(p.variables || '{}')
  end

  def profile_params
    params[:profile][:variables] = params[:variables].to_json
    params.require(:profile).permit(:name, :dashboard_id, :variables)
  end
end
