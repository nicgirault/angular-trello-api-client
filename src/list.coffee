angular.module 'angular-trello-api-client'
.service 'TrelloList', (TrelloClient, $http) ->
  endPoints =
    get:
      list: '/lists/:idList'
      field: '/lists/:idList/:field'
      actions: '/lists/:idList/actions'
      board: '/lists/:idList/board'
      boardField: '/lists/:idList/board/:field'
      cards: '/lists/:idList/cards'
    put:
      list: '/lists/:idList'
      closed: '/lists/:idList/closed'
      idBoard: '/lists/:idList/idBoard'
      name: '/lists/:idList/name'
      pos: '/lists/:idList/pos'
      subscribed: '/lists/:idList/subscribed'
    post:
      lists: '/lists'
      archiveAllCards: '/lists/:idList/archiveAllCards'
      cards: '/lists/:idList/cards'
      moveAllCards: '/lists/:idList/moveAllCards'
  get: (boardId) ->
    return unless boardId
    $http.get 'boards/' + boardId
  getCards: (boardId) ->
