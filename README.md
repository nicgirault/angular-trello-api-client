# Angular Trello API Client

An angular Trello Client bypassing the Trello client.js (based on jQuery).
This Client use [Satellizer](https://github.com/sahat/satellizer) for authentication.

You don't know [Trello](trello.com)? Youhou, this is the day your life changed!

## Installation

```bash
# Bower
bower install angular-trello-api-client
```

## Usage

```javascript
angular.module('demo', [
  'ng',
  'satellizer',
  'angular-trello-api-client',
])

.config(function(TrelloClientProvider){
  TrelloClientProvider.init({
    key: 'trello app key',
    appName: 'Your app name displayed in authentication popup',
    tokenExpiration: 'never',
    scope: ['read', 'write', 'account'],
  });
})

.controller('demoCtrl', function($scope, TrelloClient){

  $scope.authenticate = TrelloClient.authenticate

  $scope.getMyBoards = function(){
    TrelloClient.get('/members/me/boards').then(function(response){
      console.log(response);
    });
  };
});
```

[Trello API Doc](https://developers.trello.com/advanced-reference)
