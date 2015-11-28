angular.module('angular-trello-api-client').service('TrelloBoard', function(TrelloClient, $http) {
  var endPoints;
  endPoints = {
    board: '/boards',
    cards: '/boards/:boardId/cards',
    lists: '/boards/:boardId/lists'
  };
  return {
    get: function(boardId) {
      if (!boardId) {
        return;
      }
      return $http.get('boards/' + boardId);
    },
    getCards: function(boardId) {}
  };
});

angular.module('angular-trello-api-client').service('TrelloList', function(TrelloClient, $http) {
  var endPoints;
  endPoints = {
    get: {
      list: '/lists/:idList',
      field: '/lists/:idList/:field',
      actions: '/lists/:idList/actions',
      board: '/lists/:idList/board',
      boardField: '/lists/:idList/board/:field',
      cards: '/lists/:idList/cards'
    },
    put: {
      list: '/lists/:idList',
      closed: '/lists/:idList/closed',
      idBoard: '/lists/:idList/idBoard',
      name: '/lists/:idList/name',
      pos: '/lists/:idList/pos',
      subscribed: '/lists/:idList/subscribed'
    },
    post: {
      lists: '/lists',
      archiveAllCards: '/lists/:idList/archiveAllCards',
      cards: '/lists/:idList/cards',
      moveAllCards: '/lists/:idList/moveAllCards'
    }
  };
  return {
    get: function(boardId) {
      if (!boardId) {
        return;
      }
      return $http.get('boards/' + boardId);
    },
    getCards: function(boardId) {}
  };
});

angular.module('angular-trello-api-client', []);

angular.module('angular-trello-api-client').provider('TrelloClient', function() {
  var $config;
  $config = {
    applicationKey: null,
    auth: {
      name: null,
      endpoint: 'https://trello.com'
    },
    apiEndpoint: 'https://api.trello.com',
    intentEndpoint: 'https://trello.com',
    version: 1,
    expiration: 'never',
    storageKey: 'trello_token'
  };
  this.init = function(config) {
    if (config == null) {
      return;
    }
    return angular.extend($config, config);
  };
  this.$get = function($location, $http, $window, $httpParamSerializer) {
    var TrelloClient, authorizeURL, baseURL, completeRequest, i, len, localStorage, method, readStorage, ref, ref1, regexToken, token, writeStorage;
    baseURL = $config.apiEndpoint + "/" + $config.version + "/";
    token = null;
    localStorage = $window.localStorage;
    if (localStorage != null) {
      readStorage = function() {
        return localStorage[$config.storageKey];
      };
      writeStorage = function(value) {
        if (value === null) {
          return delete localStorage[$config.storageKey];
        } else {
          return localStorage[$config.storageKey] = value;
        }
      };
    } else {
      readStorage = writeStorage = function() {};
    }
    authorizeURL = function(userArgs) {
      var args;
      args = {
        response_type: "token",
        key: $config.applicationKey
      };
      angular.extend(args, userArgs);
      return $config.auth.endpoint + "/" + $config.version + "/authorize?" + $httpParamSerializer(args);
    };
    completeRequest = function(config) {
      if (config == null) {
        config = {};
      }
      if (config.params == null) {
        config.params = {};
      }
      config.params.token = token;
      config.params.key = $config.applicationKey;
      return config;
    };
    regexToken = /[&#]?token=([0-9a-f]{64})/;
    if (token == null) {
      token = readStorage();
    }
    if (token == null) {
      token = (ref = regexToken.exec($location.path())) != null ? ref[1] : void 0;
    }
    $location.path($location.path().replace(regexToken, ''));
    TrelloClient = {};
    TrelloClient.version = function() {
      return $config.version;
    };
    TrelloClient.key = function() {
      return $config.applicationKey;
    };
    TrelloClient.token = function() {
      return token;
    };
    TrelloClient.authorized = function() {
      return token != null;
    };
    TrelloClient.deauthorize = function() {
      token = null;
      return writeStorage(token);
    };
    ref1 = ['get', 'post', 'put', 'delete'];
    for (i = 0, len = ref1.length; i < len; i++) {
      method = ref1[i];
      TrelloClient[method] = function(endpoint, config) {
        if (!TrelloClient.isAuthorized()) {
          return;
        }
        config = completeRequest(config);
        return $http[method]($config.apiEndpoint + endpoint, config);
      };
    }
    TrelloClient.authorize = function(userOpts) {
      var handlePopupMessage, height, k, left, opts, origin, ref2, ref3, scope, top, v, width;
      opts = {
        type: 'redirect',
        persist: true,
        interactive: true,
        scope: {
          read: true,
          write: true,
          account: false
        },
        expiration: '30days'
      };
      angular.extend(opts, userOpts);
      regexToken = /[&#]?token=([0-9a-f]{64})/;
      if (token == null) {
        token = readStorage();
      }
      console.log($location.hash);
      if (token == null) {
        token = (ref2 = regexToken.exec($location.hash)) != null ? ref2[1] : void 0;
      }
      handlePopupMessage = function(event) {
        var ref3;
        window.removeEventListener('message', handlePopupMessage);
        if (event.origin !== $config.auth.endpoint) {
          return;
        }
        if ((ref3 = event.source) != null) {
          ref3.close();
        }
        if ((event.data != null) && event.data.length > 4) {
          token = event.data;
          writeStorage(token);
          return typeof opts.success === "function" ? opts.success() : void 0;
        }
        token = null;
        writeStorage(token);
        return typeof opts.error === "function" ? opts.error() : void 0;
      };
      if (TrelloClient.authorized()) {
        writeStorage(token);
        $location.hash = $location.hash.replace(regexToken, '');
        return typeof opts.success === "function" ? opts.success() : void 0;
      }
      if (!opts.interactive) {
        return typeof opts.error === "function" ? opts.error() : void 0;
      }
      scope = ((function() {
        var ref3, results;
        ref3 = opts.scope;
        results = [];
        for (k in ref3) {
          v = ref3[k];
          if (v) {
            results.push(k);
          }
        }
        return results;
      })()).join(',');
      switch (opts.type) {
        case 'popup':
          width = 420;
          height = 470;
          left = window.screenX + (window.innerWidth - width) / 2;
          top = window.screenY + (window.innerHeight - height) / 2;
          origin = (ref3 = /^[a-z]+:\/\/[^\/]*/.exec(location)) != null ? ref3[0] : void 0;
          if (typeof window.addEventListener === "function") {
            window.addEventListener('message', handlePopupMessage, false);
          }
          window.open(authorizeURL({
            return_url: origin,
            callback_method: 'postMessage',
            scope: scope,
            expiration: opts.expiration,
            name: opts.name
          }), 'trello', "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top);
          break;
        default:
          $window.location = authorizeURL({
            redirect_uri: location.href,
            callback_method: "fragment",
            scope: scope,
            expiration: opts.expiration,
            name: opts.name
          });
      }
    };
    return TrelloClient;
  };
});
