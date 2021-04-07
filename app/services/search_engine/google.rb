require "net/http"
require "json"

module SearchEngine
  class Google < SearchEngine::Base
    def initialize(config)
        super

        @api_base_url = "#{@config[:base_url]}?gl=de&key=#{@config[:api_key]}&cx=#{@config[:search_engine_id]}";
    end

    def get_search_engine_type
        "Google"
    end

    def search_engine_api_call(search_query)
      url = "#{@api_base_url}&q=#{search_query}"
      response = Net::HTTP.get_response(URI(url))

      raise "Search engine api call failed." if !response.instance_of? Net::HTTPOK

      body = JSON.parse(response.body)

      if (body["items"].empty?)
        return {
          total: 0,
          items: [],
        }
      end

      items = [];

      body["items"].each do |item|
        items.push({
            link: item["link"],
            displayLink: item["displayLink"],
            title: item["title"],
            searchEngineName: get_search_engine_type()
        })
      end

      {
          total: body["searchInformation"]["totalResults"].to_i,
          items: items,
      }
    end
  end
end