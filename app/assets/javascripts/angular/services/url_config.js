angular.module("Prometheus.services").factory('URLConfigDecoder', function($location) {
  return function(defaultHash) {
    var hash = $location.hash() || defaultHash;
    if (!hash) {
      return {};
    }
    // Decodes UTF-8.
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.btoa#Unicode_Strings
    var configJSON = unescape(decodeURIComponent(window.atob(hash)));
    var config = JSON.parse(configJSON);
    return config;
  };
});

angular.module("Prometheus.services").factory('URLHashEncoder', ["URLConfigDecoder", function(URLConfigDecoder) {
  return function(config) {
    var urlConfig = URLConfigDecoder();
    for (var o in config) {
      urlConfig[o] = config[o];
    }
    var configJSON = JSON.stringify(urlConfig);
    // Encodes UTF-8.
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.btoa#Unicode_Strings
    return window.btoa(encodeURIComponent(escape(configJSON)));
  };
}]);

angular.module("Prometheus.services").factory('URLConfigEncoder', ["$location", "URLHashEncoder", function($location, URLHashEncoder) {
  return function(config) {
    $location.hash(URLHashEncoder(config));
  };
}]);

angular.module("Prometheus.services").factory('URLVariablesDecoder', ['$location', function($location) {
  return function() {
    return $location.search();
  };
}]);

angular.module("Prometheus.services").factory('URLParser', function() {
  var identity = function (a) { return a; };

  function extractParams(queryString, decodeFn) {
    return queryString.split('&').reduce(function (query, param) {
      var splitIndex = param.indexOf('=');
      var key = decodeFn(splitIndex > 0 ? param.slice(0, splitIndex) : param);
      var value = decodeFn(splitIndex > 0 ? param.slice(splitIndex + 1) : '');
      // if key already exists, add this value to list of values for key
      query[key] = query[key] ? [].concat(query[key], value) : value;
      return query;
    }, {});
  }

  function stringifyParams(queryParams, encodeFn) {
    return Object.keys(queryParams)
      .reduce(function (paramList, key) {
        // agnostic to single vs. array of values for key
        [].concat(queryParams[key]).forEach(function (value) {
          paramList.push(encodeFn(key) + (value ? ('=' + encodeFn(value)) : ''));
        });
        return paramList;
      }, [])
      .join('&');
  }

  function URLRepresentation(url, options) {
    options = options || {};

    var hashIndex = url.lastIndexOf('#');
    var ignoreHash = options.ignoreHash || hashIndex < 0;
    var urlWithoutHash = (ignoreHash ? url : url.slice(0, hashIndex));
    var queryIndex = urlWithoutHash.indexOf('?');
    var decodeFn = (options.decode !== false) ? decodeURIComponent : identity;

    this.path = queryIndex > 0 ? urlWithoutHash.slice(0, queryIndex) : urlWithoutHash;
    this.query = extractParams((queryIndex > 0 ? urlWithoutHash.slice(queryIndex + 1) : ''), decodeFn);
    this.hash = extractParams(ignoreHash ? '' : url.slice(hashIndex + 1), decodeFn);
  }

  URLRepresentation.prototype = {
    stringify: function(withEncoding) {
      var encodeFn = (withEncoding !== false) ? encodeURIComponent : identity;
      var queryString = stringifyParams(this.query, encodeFn);
      var hashString = stringifyParams(this.hash, encodeFn);

      return this.path + (queryString ? ('?' + queryString) : '') + (hashString ? ('#' + hashString) : '');
    },
    getQueryParams: function () { return this.query; },
    setQueryParam: function (key, value) { this.query[key] = value; },
    removeQueryParam: function (key) { delete this.query[key]; },
    getHashParams: function () { return this.hash; },
    setHashParam: function (key, value) { this.hash[key] = value; },
    removeHashParam: function (key) { delete this.hash[key]; }
  };

  function BrokenURL(brokenURL, error) {
    this.brokenURL = brokenURL;
    this.error = error;
  }

  BrokenURL.prototype = {
    stringify: function() {
      return this.brokenURL;
    },
    getQueryParams: function () { return []; },
    setQueryParam: function () {},
    removeQueryParam: function () {},
    getHashParams: function () { return []; },
    setHashParam: function () {},
    removeHashParam: function () {}
  };

  return function (url, options) {
    try {
      return new URLRepresentation(url, options);
    } catch (e) {
      return new BrokenURL(url, e.message);
    }
  };
});
