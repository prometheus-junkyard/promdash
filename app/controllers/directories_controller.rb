class DirectoriesController < ApplicationController
  before_action :set_directory, only: [:edit, :destroy, :update]
  before_action :set_unassigned_dashboards, only: [:edit, :new, :index]

  def index
    @directories = Directory.order("lower(name)").includes(:dashboards)
    respond_to do |format|
      format.html { render 'index' }
      format.json do
        @directories = @directories.select {|d| d.dashboards.present? }
        if Dashboard.unassigned.present?
          @directories << Dashboard.new(name: 'Unassigned dashboards')
        end
        render json: @directories
      end
    end
  end

  def show
    if params[:id] == "unassigned"
      render json: Dashboard.unassigned.cloneable, root: :dashboards
    else
      set_directory
      render json: @directory.dashboards.cloneable, root: :dashboards
    end
  end

  def new
    @directory = Directory.new
  end

  def edit
  end

  def create
    @directory = Directory.new(directory_params)
    @directory.dashboards = Dashboard.where(id: directory_params[:dashboard_ids])

    respond_to do |format|
      if @directory.save
        format.html { redirect_to root_path, notice: 'Server was successfully created.' }
        format.json { render action: 'show', status: :created, location: @directory }
      else
        format.html do
          set_unassigned_dashboards
          render action: 'new'
        end
        format.json { render json: @directory.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    # If no dashboard_ids key is sent, unassign all dashboards from the
    # directory.
    params[:directory][:dashboard_ids] ||= []

    respond_to do |format|
      if @directory.update(directory_params)
        format.html { redirect_to root_path, notice: 'Server was successfully updated.' }
        format.json { head :no_content }
      else
        format.html do
          set_unassigned_dashboards
          render action: 'edit'
        end
        format.json { render json: @directory.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @directory.destroy
    respond_to do |format|
      format.html { redirect_to root_path }
      format.json { head :no_content }
    end
  end

  private
  def set_directory
    @directory = Directory.includes(:dashboards).find(params[:id])
  end

  def set_unassigned_dashboards
    @unassigned_dashboards = Dashboard.unassigned.alphabetical
  end

  def directory_params
    params.require(:directory).permit(:name, dashboard_ids: [])
  end
end
