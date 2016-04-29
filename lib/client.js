/**
 * Copyright 2016 Open Permissions Platform Coalition
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/* global -Promise */
var request = require('superagent');
var Promise = require('bluebird');

/**
 * Extend superagent to include support for bluebird promises, by
 * calling `.promise()` instead of `.end()`.
 *
 * see https://gist.github.com/epeli/11209665
 */
request.Request.prototype.promise = function() {
  var self = this;
  return new Promise(function(resolve, reject){
    request.Request.prototype.end.call(self, function(err, res) {
      if (err) {
        reject(err);
      } else if (res.status >= 400) {
        var error = new Error(res.error.message);
        error.response = res;
        reject(error);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Simple wrapper around superagent that uses the provided base URL in requests.
 *
 * @param {string} baseUrl - Base URL for the service's location
 * @param {boolean} cors - Whether need to support CORS
 * @return {object}
 */
function client(baseUrl, cors) {
  function createPromise(req, token, contentType) {
    if (token) { req.set('Authorization', token); }
    if (cors) { req.withCredentials(); }
    if (contentType) {req.set('Content-Type', contentType)}
    return req.promise();
  }

  return {
    baseUrl: baseUrl,
    _joinUrl: function (path) {
      if (path) {
        return this.baseUrl + '/' + path;
      } else {
        return this.baseUrl;
      }
    },
    get: function (path, data, token) {
      var req = request.get(this._joinUrl(path));
      if (data) { req.query(data); }

      return createPromise(req, token);
    },
    post: function (path, data, token, contentType) {
      var req = request.post(this._joinUrl(path));
      if (data) { req.send(data); }

      return createPromise(req, token, contentType);
    },
    put: function (path, data, token) {
      var req = request.put(this._joinUrl(path));
      if (data) { req.send(data); }

      return createPromise(req, token);
    },
    patch: function (path, data, token) {
      var req = request.patch(this._joinUrl(path));
      if (data) { req.send(data); }

      return createPromise(req, token);
    },
    head: function (path, data, token) {
      var req = request.head(this._joinUrl(path));
      if (data) { req.send(data); }

      return createPromise(req, token);
    },
    del: function (path, token) {
      var req = request.del(this._joinUrl(path));

      return createPromise(req, token);
    }
  };
}

module.exports = client;
