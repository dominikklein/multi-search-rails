class Api::SearchController < ApplicationController
  def search_by_query
    search_engine_manager = SearchEngineManager.new()
    result = search_engine_manager.search_by_query(params[:query], 10)
    render json: result
  end
end