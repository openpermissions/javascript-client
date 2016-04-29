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
var api = require('./client');

/**
 * Initialise a client for the Copyright Hub authentication service.
 *
 * @param {string} baseUrl - Base URL for the service's location
 * @param {boolean} cors - Whether need to support CORS
 * @param {object} [func] - Inject API function that returns a client with `get` & `post` methods
 * @return {object}
 */
function authentication (baseUrl, cors, func) {
  if (!func) {
    func = api;
  }

  var client = func(baseUrl, cors);

  return {
    /**
     * Get a token
     *
     * @param {string} clientId
     * @param {string} clientSecret
     * @param {string} scope
     * @return {promise}
     */
    getToken: function (clientId, clientSecret, scope) {
      var token = 'Basic ' + btoa(clientId + ':'+clientSecret);
      var body = 'grant_type=client_credentials';
      if (scope) {
        body = body + '&scope=' + scope
      }
        return client.post('token', body, token)
    }
  }
}

module.exports = authentication;
