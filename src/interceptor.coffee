angular.module 'trello-api-client'
.factory 'TrelloInterceptor', [
  '$q'
  'SatellizerShared'
  'TrelloClientConfig'
  ($q, shared, TrelloClientConfig) ->
    request: (request) ->
      return request unless request.trelloRequest

      token = localStorage.getItem TrelloClientConfig.localStorageTokenName
      if token?
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
