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
/* global -Promise */
var Promise = require('bluebird');
/**
 * Initialise a client for the repository service.
 *
 * @param {string} baseUrl - Base URL for the service's location
 * @param {boolean} cors - Whether need to support CORS
 * @param {object} [func] - Inject API function that returns a client with `get` & `post` methods
 * @return {object}
 */
function repository (baseUrl, cors, func) {
  if (!func) {
    func = api;
  }


  var client = func(baseUrl, cors);

  return {
    token: null,

    /**
     * Get all licence offer ids for a repository
     *
     * @param {string} repositoryId
     * @return {promise}
     */
    getOffers: function(repositoryId) {
      return client.get('repositories/'+ repositoryId + '/offers', null, this.token)
    },

    /**
     * Get a licence offer
     *
     * @param {string} repositoryId
     * @param {string} offerId
     * @return {promise}
     */
    getOffer: function (repositoryId, offerId) {
      return client.get('repositories/' + repositoryId + '/offers/'+ offerId, null, this.token)
    },

    /**
     * Get save licence offer to repository
     *
     * @param {string} repositoryId
     * @param {string} offer
     * @return {promise}
     */
    saveOffer: function(repositoryId, offer) {
      return client.post('repositories/' + repositoryId + '/offers', offer, this.token, 'application/ld+json')
    }
  }
}

module.exports = repository;
