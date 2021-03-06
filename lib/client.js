// Generated by CoffeeScript 1.6.3
var Client, HTTPS, Iconv, QS;

HTTPS = require('https');

Iconv = require('iconv-lite');

QS = require('qs');

Client = (function() {
  Client.SERVER_NAME = 'money.yandex.ru';

  Client.SERVER_PORT = 443;

  Client.REQUEST_CHARSET = 'utf-8';

  Client.RESPONSE_MAX_SIZE = 1024 * 1024;

  function Client(options) {
    var _ref, _ref1, _ref2, _ref3;
    if (options == null) {
      options = Object.create(null);
    }
    this._host = (_ref = options.host) != null ? _ref : this.constructor.SERVER_NAME;
    this._port = (_ref1 = options.port) != null ? _ref1 : this.constructor.SERVER_PORT;
    this._charset = (_ref2 = options.charset) != null ? _ref2 : this.constructor.REQUEST_CHARSET;
    this._token = (_ref3 = options.token) != null ? _ref3 : null;
    this._headers = Object.create(null);
  }

  Client.prototype._requestOptions = function(endpoint, body) {
    var fullHeaders, headers, key, options, path, value, _ref;
    path = '/api/' + endpoint;
    headers = {
      'Authorization': 'Bearer ' + this._token,
      'Content-Type': 'application/x-www-form-urlencoded; charset=' + this._charset,
      'Content-Length': body.length
    };
    fullHeaders = Object.create(null);
    _ref = this._headers;
    for (key in _ref) {
      value = _ref[key];
      fullHeaders[key] = value;
    }
    for (key in headers) {
      value = headers[key];
      fullHeaders[key] = value;
    }
    options = {
      host: this._host,
      port: this._port,
      method: 'POST',
      path: path,
      headers: fullHeaders
    };
    return options;
  };

  Client.prototype._responseHandler = function(callback) {
    return function(response) {
      var chunks;
      chunks = [];
      response.on('readable', function() {
        chunks.push(response.read());
        return void 0;
      });
      response.on('end', function() {
        var body, output;
        if (typeof callback !== 'function') {
          return;
        }
        body = Buffer.concat(chunks);
        switch (Math.floor(response.statusCode / 100)) {
          case 2:
            output = JSON.parse(Iconv.decode(body, 'utf-8'));
            callback(null, output);
            break;
          case 4:
            callback(new Error(response.headers['www-authenticate']));
            break;
          default:
            callback(new Error('Unexpected status code'));
        }
        return void 0;
      });
      return void 0;
    };
  };

  Client.prototype.setHeader = function(name, value) {
    this._headers[name] = value;
    return this;
  };

  Client.prototype.removeHeader = function(name) {
    delete this._headers[name];
    return this;
  };

  Client.prototype.invokeMethod = function(name, input, callback) {
    var blob, request;
    blob = Iconv.encode(QS.stringify(input), this._charset);
    request = HTTPS.request(this._requestOptions(name, blob));
    request.on('response', this._responseHandler(callback));
    request.on('error', function(error) {
      if (typeof callback === "function") {
        callback(error);
      }
      return void 0;
    });
    request.end(blob);
    return this;
  };

  Client.prototype.setToken = function(token) {
    this._token = token;
    return this;
  };

  Client.prototype.removeToken = function() {
    this._token = null;
    return this;
  };

  Client.prototype.revokeToken = function(callback) {
    var _this = this;
    return this.invokeMethod('revoke', null, function(error) {
      if (error == null) {
        _this._token = null;
      }
      return typeof callback === "function" ? callback(error) : void 0;
    });
  };

  Client.prototype.accountInfo = function(callback) {
    return this.invokeMethod('account-info', null, callback);
  };

  Client.prototype.operationDetails = function(id, callback) {
    return this.invokeMethod('operation-details', {
      operation_id: id
    }, callback);
  };

  Client.prototype.operationHistory = function(selector, callback) {
    return this.invokeMethod('operation-history', selector, callback);
  };

  Client.prototype.requestPayment = function(input, callback) {
    return this.invokeMethod('request-payment', input, callback);
  };

  Client.prototype.processPayment = function(input, callback) {
    return this.invokeMethod('process-payment', input, callback);
  };

  return Client;

})();

module.exports = Client;
