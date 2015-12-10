angular.module('demo', [
  'ng',
  'trello-api-client',
  'satellizer'
])

.config(function(TrelloClientProvider){
  TrelloClientProvider.init({
    key: '2dcb2ba290c521d2b5c2fd69cc06830e',
    appName: 'Not So Shitty',
    tokenExpiration: 'never',
    scope: ['read', 'write', 'account'],
  });
})

.controller('demoCtrl', function($scope, TrelloClient){
  $scope.popupOptions = {
    type: 'popup'
  }
  $scope.authenticate = TrelloClient.authenticate
  $scope.getBoards = function(){
    TrelloClient.get('/members/me/boards').then(function(response){
      console.log(response);
    }).catch(function(error){
      console.warn(error);
    });
  };
});
