# multi-search-rails

The project is about a small REST-API, which can be used to search with multiple search engines at the same time.
At the moment the route `/api/search/?serchQuery=Test` can be used to search for a query and the ranking from the different
search engines can be compared:

```
    {
        "total": 10,
        "data": [
            [
                {
                    "link": "https://www.test.de/",
                    "displayLink": "www.test.de",
                    "title": "Stiftung Warentest",
                    "searchEngineName": "Google"
                },
                {
                    "link": "https://www.test.de/",
                    "displayLink": "https://www.test.de",
                    "title": "Stiftung Warentest - Aktuell auf test.de",
                    "searchEngineName": "Bing"
                }
            ],
            ...
        ]
    }
```

In the current state the search engines the following search engines are available: Google, Bing.
It's easily possible to add additional search engines.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Check your Ruby version

    ```shell
    ruby -v
    ```

    The ouput should start with something like `ruby 2.6.6`

    If not, install the right ruby version using [rbenv](https://github.com/rbenv/rbenv) (it could take a while):

    ```shell
    rbenv install 2.6.6
    ```

2. Install your dependencies

    ```
    cd path/to/multi-search
    bundle install
    ```

3. Copy the `config/search_engines.yml.dist` to `config/search_engines.yml` and add the needed config options for the search engines.

4. Start your app

    ```
    rails s
    ```

    or

    ```
    puma -p 3000
    ```