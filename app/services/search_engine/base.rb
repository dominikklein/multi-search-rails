module SearchEngine
  class Base
    def initialize(config)
      @config = config
    end

    def search(search_query)
      search_engine_result = {}

      if search_query
        search_engine_result = search_engine_api_call(search_query)
      else
        search_engine_result = {
            total: 0,
            items: [],
        }
      end

      search_engine_result
    end

    def get_search_engine_type
        raise "Missing implementation of method 'get_search_engine_type' for class '#{self.class.name}'"
    end

    def search_engine_api_call(search_query)
        raise "Missing implementation of method 'search_engine_api_call' for class '#{self.class.name}'"
    end
  end
end