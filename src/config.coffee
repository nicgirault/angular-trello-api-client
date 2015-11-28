angular.module 'trello-api-client'
.constant 'TrelloClientConfig', {
  key: null
  appName: null
  authEndpoint: 'https://trello.com'
  apiEndpoint: 'https://api.trello.com'
  intentEndpoint: 'https://trello.com'
  version: 1
  tokenExpiration: 'never'
  scope: ['read', 'write', 'account']
  localStoragePrefix: 'trello'
}
