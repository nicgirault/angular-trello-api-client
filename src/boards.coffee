angular.module 'angular-trello-api-client'
.service 'TrelloBoard', (TrelloClient, $http) ->
  endPoints =
    board: '/boards'
    cards: '/boards/:boardId/cards'
    lists: '/boards/:boardId/lists'
  get: (boardId) ->
    return unless boardId
    $http.get 'boards/' + boardId
  getCards: (boardId) ->
