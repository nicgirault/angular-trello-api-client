angular.module('demo', ['ng', 'angular-trello-api-client'])
.config(function(TrelloClientProvider){
  TrelloClientProvider.init({
    applicationKey: '2dcb2ba290c521d2b5c2fd69cc06830e'
  });
})
.controller('demoCtrl', function($scope, TrelloClient){
  $scope.popupOptions = {
    type: 'popup'
  }
  $scope.authenticatePopup = TrelloClient.authorize
  $scope.authenticateRedirect = TrelloClient.authorize
});
