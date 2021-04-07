require "net/http"
require "json"

module SearchEngine
  class Bing < SearchEngine::Base
    def initialize(config)
      super

      @api_base_url = "#{@config[:base_url]}?cc=de&offset=0&count=10";
    end

    def get_search_engine_type
        "Bing"
    end

    def search_engine_api_call(search_query)
      uri = URI("#{@api_base_url}&q=#{search_query}")

      request = Net::HTTP::Get.new(uri)
      request["Ocp-Apim-Subscription-Key"] = @config[:api_key]
      response = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => true) { |http|
        http.request(request)
      }

      raise "Search engine api call failed." if !response.instance_of? Net::HTTPOK

      body = JSON.parse(response.body)

      if (body["webPages"]["value"].empty?)
        return {
          total: 0,
          items: [],
        }
      end

      items = [];

      body["webPages"]["value"].each do |item|
        items.push({
            link: item["link"],
            displayLink: item["displayLink"],
            title: item["title"],
            searchEngineName: get_search_engine_type()
        })
      end

      {
          total: body["webPages"]["totalEstimatedMatches"].to_i,
          items: items,
      }
    end
  end
end