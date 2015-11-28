angular.module 'angular-trello-api-client'
.factory 'TrelloInterceptor', [
  '$q'
  'SatellizerConfig'
  'SatellizerStorage'
  'SatellizerShared'
  'TrelloClientConfig'
  ($q, config, storage, shared, TrelloClientConfig) ->
    request: (request) ->
      return request unless request.trelloRequest

      if shared.isAuthenticated()
        tokenName = if config.tokenPrefix then config.tokenPrefix + '_' + config.tokenName else config.tokenName
        token = storage.get tokenName
        request.params ?= {}
        request.params.key = TrelloClientConfig.key
        request.params.token = token
      request
    responseError: (response) ->
      $q.reject response
]
.config [
  '$httpProvider'
  ($httpProvider) ->
    $httpProvider.interceptors.push 'TrelloInterceptor'
]
