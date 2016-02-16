angular.module 'trello-api-client'
.provider 'TrelloClient', ($authProvider, TrelloClientConfig) ->
  @init = (config) ->
    return unless config?
    angular.extend TrelloClientConfig, config

    $authProvider.httpInterceptor = (request) -> false
    $authProvider.oauth2 {
      name: TrelloClientConfig.appName
      key: TrelloClientConfig.key
      returnUrl: TrelloClientConfig.returnUrl
      authorizationEndpoint: "#{ TrelloClientConfig.authEndpoint }/#{ TrelloClientConfig.version }/authorize"
      defaultUrlParams: ['response_type', 'key', 'return_url', 'expiration', 'scope', 'name']
      requiredUrlParams: null
      optionalUrlParams: null
      scope: TrelloClientConfig.scope
      scopeDelimiter: ','
      type: 'redirect'
      popupOptions: TrelloClientConfig.popupOptions
      responseType: 'token'
      expiration: TrelloClientConfig.tokenExpiration
    }

  @$get = ($location, $http, $window, $auth, $q) ->
    baseURL = "#{ TrelloClientConfig.apiEndpoint }/#{ TrelloClientConfig.version }"
    TrelloClient = {}
    TrelloClient.authenticate = ->
      $auth.authenticate(TrelloClientConfig.appName).then (response)->
        localStorage.setItem TrelloClientConfig.localStorageTokenName, response.token
        return response
    for method in ['get', 'post', 'put', 'delete']
      do (method) ->
        TrelloClient[method] = (endpoint, config) ->
          config ?= {}
          config.trelloRequest = true # for interceptor
          deferred = $q.defer()
          # unless localStorage.getItem(TrelloClientConfig.localStorageTokenName)?
          if not localStorage.getItem(TrelloClientConfig.localStorageTokenName)?
            deferred.reject 'Not authenticated'
          else
            $http[method] baseURL + endpoint, config
            .then (response) ->
              deferred.resolve response
            .catch deferred.reject

          deferred.promise

    return TrelloClient
  return
