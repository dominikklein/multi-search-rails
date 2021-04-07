class Api::SearchController < ApplicationController
  def search_by_query
    search_engine_manager = SearchEngineManager.new()
    result = search_engine_manager.search_by_query(params[:query])
    render json: { data: result, total: result.length }
  end
end