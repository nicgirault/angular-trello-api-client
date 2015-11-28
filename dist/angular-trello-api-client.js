angular.module('trello-api-client', ['satellizer']);

angular.module('trello-api-client').constant('TrelloClientConfig', {
  key: null,
  appName: null,
  authEndpoint: 'https://trello.com',
  apiEndpoint: 'https://api.trello.com',
  intentEndpoint: 'https://trello.com',
  version: 1,
  tokenExpiration: 'never',
  scope: ['read', 'write', 'account'],
  localStoragePrefix: 'trello'
});

angular.module('trello-api-client').factory('TrelloInterceptor', [
  '$q', 'SatellizerConfig', 'SatellizerStorage', 'SatellizerShared', 'TrelloClientConfig', function($q, config, storage, shared, TrelloClientConfig) {
    return {
      request: function(request) {
        var token, tokenName;
        if (!request.trelloRequest) {
          return request;
        }
        if (shared.isAuthenticated()) {
          tokenName = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;
          token = storage.get(tokenName);
          if (request.params == null) {
            request.params = {};
          }
          request.params.key = TrelloClientConfig.key;
          request.params.token = token;
        }
        return request;
      },
      responseError: function(response) {
        return $q.reject(response);
      }
    };
  }
]).config([
  '$httpProvider', function($httpProvider) {
    return $httpProvider.interceptors.push('TrelloInterceptor');
  }
]);

angular.module('trello-api-client').provider('TrelloClient', function($authProvider, TrelloClientConfig) {
  this.init = function(config) {
    if (config == null) {
      return;
    }
    angular.extend(TrelloClientConfig, config);
    $authProvider.tokenPrefix = TrelloClientConfig.localStoragePrefix;
    $authProvider.httpInterceptor = function(request) {
      return false;
    };
    return $authProvider.oauth2({
      name: TrelloClientConfig.appName,
      key: TrelloClientConfig.key,
      returnUrl: window.location.origin,
      authorizationEndpoint: TrelloClientConfig.authEndpoint + "/" + TrelloClientConfig.version + "/authorize",
      defaultUrlParams: ['response_type', 'key', 'return_url', 'expiration', 'scope', 'name'],
      requiredUrlParams: null,
      optionalUrlParams: null,
      scope: TrelloClientConfig.scope,
      scopeDelimiter: ',',
      type: 'redirect',
      popupOptions: TrelloClientConfig.popupOptions,
      responseType: 'token',
      expiration: TrelloClientConfig.tokenExpiration
    });
  };
  this.$get = function($location, $http, $window, $auth) {
    var TrelloClient, baseURL, fn, i, len, method, ref;
    baseURL = TrelloClientConfig.apiEndpoint + "/" + TrelloClientConfig.version;
    TrelloClient = {};
    TrelloClient.authenticate = function() {
      return $auth.authenticate(TrelloClientConfig.appName).then(function(response) {
        return $auth.setToken(response.token);
      });
    };
    ref = ['get', 'post', 'put', 'delete'];
    fn = function(method) {
      return TrelloClient[method] = function(endpoint, config) {
        if (config == null) {
          config = {};
        }
        config.trelloRequest = true;
        if (!$auth.isAuthenticated()) {
          return;
        }
        return $http[method](baseURL + endpoint, config);
      };
    };
    for (i = 0, len = ref.length; i < len; i++) {
      method = ref[i];
      fn(method);
    }
    return TrelloClient;
  };
});
