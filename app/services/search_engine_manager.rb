class SearchEngineManager
  attr_reader :search_engines

  def initialize
    @search_engines = []

    Rails.configuration.search_engines.each do |key, value|
        @search_engines.push(Object.const_get("SearchEngine::#{key}").new(value))
    end
  end

  def search_by_query(query)
    result_items = []

    return result_items if query.blank?

    @search_engines.each do |search_engine|
      search_engine_result = search_engine.search(query)

      if (search_engine_result[:total] > 0)
        search_engine_result[:items].each_with_index do |item, index|
          if (result_items[index])
            result_items[index].push(item)
          else
            result_items.push([item])
          end
        end
      end
    end

    result_items
  end
end