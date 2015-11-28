angular.module 'angular-trello-api-client'
.provider 'TrelloClient', ->
  $config =
    applicationKey: null
    auth:
      name: null
      endpoint: 'https://trello.com'
    apiEndpoint: 'https://api.trello.com'
    intentEndpoint: 'https://trello.com'
    version: 1
    expiration: 'never'
    storageKey: 'trello_token'

  @init = (config) ->
    return unless config?
    angular.extend $config, config

  @$get = ($location, $http, $window, $httpParamSerializer) ->
    baseURL = "#{ $config.apiEndpoint }/#{ $config.version }/"
    token = null

    localStorage = $window.localStorage
    if localStorage?
      readStorage = -> localStorage[$config.storageKey]
      writeStorage = (value) ->
        if value == null
          delete localStorage[$config.storageKey]
        else
          localStorage[$config.storageKey] = value
    else
      readStorage = writeStorage = ->

    authorizeURL = (userArgs) ->
      args =
        response_type: "token"
        key: $config.applicationKey

      angular.extend(args, userArgs)
      $config.auth.endpoint + "/" + $config.version + "/authorize?" + $httpParamSerializer(args)

    completeRequest = (config) ->
      config ?= {}
      config.params ?= {}
      config.params.token = token
      config.params.key = $config.applicationKey
      config

    regexToken = /[&#]?token=([0-9a-f]{64})/
    token ?= readStorage()
    token ?= regexToken.exec($location.path())?[1]
    $location.path $location.path().replace regexToken, ''
    TrelloClient = {}

    TrelloClient.version = -> $config.version
    TrelloClient.key = -> $config.applicationKey
    TrelloClient.token = -> token
    TrelloClient.authorized = -> token?

    # Clear any existing authorization
    TrelloClient.deauthorize = ->
      token = null
      writeStorage token

    for method in ['get', 'post', 'put', 'delete']
      TrelloClient[method] = (endpoint, config) ->
        return unless TrelloClient.isAuthorized()
        config = completeRequest config
        $http[method] $config.apiEndpoint + endpoint, config

    # Request a token that will allow us to make API requests on a user's behalf
    #
    # opts =
    #   type - "redirect" or "popup"
    #   name - Name to display
    #   persist - Save the token to local storage?
    #   interactive - If false, don't redirect or popup, only use the stored token, if one exists
    #   scope - The permissions we're requesting
    #   expiration - When we want the requested token to expire ("1hour", "1day", "30days", "never")
    TrelloClient.authorize = (userOpts) ->
      opts =
        type: 'redirect'
        persist: true
        interactive: true
        scope:
          read: true
          write: true
          account: false
        expiration: '30days'
      angular.extend opts, userOpts

      regexToken = /[&#]?token=([0-9a-f]{64})/

      token ?= readStorage()
      console.log $location.hash
      token ?= regexToken.exec($location.hash)?[1]

      handlePopupMessage = (event) ->
        window.removeEventListener 'message', handlePopupMessage

        return if event.origin != $config.auth.endpoint

        event.source?.close()

        if event.data? && event.data.length > 4
          token = event.data
          writeStorage token
          return opts.success?()

        token = null
        writeStorage token
        opts.error?()

      if TrelloClient.authorized()
        writeStorage token
        $location.hash = $location.hash.replace(regexToken, '')
        return opts.success?()

      # If we aren't in interactive mode, and we didn't get the token from
      # storage or from the hash, then we error out here
      if !opts.interactive
        return opts.error?()

      scope = (k for k, v of opts.scope when v).join(',')

      switch opts.type
        when 'popup'
          width = 420
          height = 470
          left = window.screenX + (window.innerWidth - width) / 2
          top = window.screenY + (window.innerHeight - height) / 2

          origin = ///^ [a-z]+ :// [^/]* ///.exec(location)?[0]

          window.addEventListener? 'message', handlePopupMessage, false
          window.open authorizeURL(
            return_url: origin
            callback_method: 'postMessage'
            scope: scope
            expiration: opts.expiration
            name: opts.name
          ), 'trello', "width=#{ width },height=#{ height },left=#{ left },top=#{ top }"
        else
          # We're leaving the current page now; but the user should be calling .authorize({ interactive: false })
          # on page load
          $window.location = authorizeURL(
            redirect_uri: location.href
            callback_method: "fragment"
            scope: scope
            expiration: opts.expiration
            name: opts.name
          )
      return
    return TrelloClient
  return
