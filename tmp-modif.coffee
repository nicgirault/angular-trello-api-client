  { key, token, apiEndpoint, authEndpoint, intentEndpoint, version } = opts

  baseURL = "#{ apiEndpoint }/#{ version }/"
  location = window.location

  Trello =
    # Request that a card be created, using the provided name, description, and
    # url.  This
    #
    # opts =
    #   name - The name to use for the card
    #   desc - The description to use for the card (optional)
    #   url - A url to attach to the card (optional)
    #
    # next = a method to be called once the card has been created.  The method
    # should take two arguments, an error and a card.  If next is not defined
    # then a promise that resolves to the card will be returned.
    addCard: (options, next) ->
      baseArgs =
        mode: 'popup'
        source: key || window.location.host

      getCard = (callback) ->
        returnUrl = (e) ->
          window.removeEventListener 'message', returnUrl
          try
            data = JSON.parse(e.data)
            if data.success
              callback(null, data.card)
            else
              callback(new Error(data.error))

        window.addEventListener? 'message', returnUrl, false

        width = 500
        height = 600
        left = window.screenX + (window.outerWidth - width) / 2
        top = window.screenY + (window.outerHeight - height) / 2

        window.open intentEndpoint + "/add-card?" + $.param($.extend(baseArgs, options)), "trello", "width=#{ width },height=#{ height },left=#{ left },top=#{ top }"

      if next?
        getCard next
      else if window.Promise
        new Promise (resolve, reject) ->
          getCard (err, card) ->
            if err
              reject(err)
            else
              resolve(card)
      else
        getCard(->)

  # Hook up convenience methods for the different collections
  # e.g. Trello.cards(id, params, success, error)
  for collection in ["actions", "cards", "checklists", "boards", "lists", "members", "organizations", "lists"]
    do (collection) ->
      Trello[collection] =
        get: (id, params, success, error) ->
          Trello.get("#{ collection }/#{ id }", params, success, error)
