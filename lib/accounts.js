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

/**
 * Construct a user object
 *
 * @param {string} email
 * @param {string} [firstName]
 * @param {string} [lastName]
 * @param {string} [phone]
 */
function userObj(email, firstName, lastName, phone) {
  var data = {email: email};
  var optional = {
    'first_name': firstName,
    'last_name': lastName,
    'phone': phone
  };

  for (var i in optional) {
    var prop = optional[i];
    if (typeof prop !== 'undefined') {
      data[i] = prop;
    }
  }

  return data;
}

var api = require('./client');

/**
 * Initialise a client for the Copyright Hub accounts service.
 *
 * @param {string} baseUrl - Base URL for the service's location
 * @param {boolean} cors - Whether need to support CORS
 * @param {object} [func] - Inject API function that returns a client with `get` & `post` methods
 * @return {object}
 */
function accounts (baseUrl, cors, func) {
  if (!func) {
    func = api;
  }
  var client = func(baseUrl, cors);

  return {
    token: null,
    /**
     * Create a user
     *
     * @param {string} email
     * @param {string} password
     * @param {bool} [hasAgreedToTerms]
     * @param {string} [firstName]
     * @param {string} [lastName]
     * @param {string} [phone]
     * @return {promise}
     */
    createUser: function (email, password, hasAgreedToTerms, firstName, lastName, phone) {
      var data = userObj(email, firstName, lastName, phone);
      data.password = password;
      data['has_agreed_to_terms'] = hasAgreedToTerms;

      return client.post('users', data);
    },

    /**
     * Update a user
     *
     * @param {string} userId - an existing user ID
     * @param {string} email
     * @param {string} [firstName]
     * @param {string} [lastName]
     * @param {string} [phone]
     * @return {promise}
     */
    updateUser: function (userId, email, firstName, lastName, phone) {
      var data = userObj(email, firstName, lastName, phone);
      return client.put('users/' + userId, data, this.token);
    },

    /**
     * Delete a user
     *
     * @param {string} userId - an existing user ID
     * @return {promise}
     */
    deleteUser: function (userId) {
      return client.del('users/' + userId, this.token);
    },

    /**
     * Update a role for a user
     *
     * @param {string} userId - an existing user ID
     * @param {string} role
     * @param {string} organisationId
     * @return {promise}
     */
    updateUserRole: function(userId, role, organisationId) {
      var data = {role: role};
      if (organisationId == null || organisationId == undefined) {
        return client.post('users/' + userId + '/roles', data, this.token)
      }
      else {
        return client.put('users/' + userId + '/organisations/' + organisationId, data, this.token)
      }
    },

    /**
     * Change password
     *
     * @param {string} userId  - an existing user ID
     * @param {string} oldPassword
     * @param {string} newPassword
     * @return {promise}
     */
    changePassword: function (userId, oldPassword, newPassword) {
      var data = {
        'previous': oldPassword,
        'password': newPassword
      };
      return client.put('users/' + userId + '/password', data, this.token);
    },

    /**
     * Login a user
     *
     * @param {string} email
     * @param {string} password
     * @return {promise}
     */
    login: function (email, password) {
      var self = this;
      return client.post('login', {'email': email, 'password': password})
                   .then(function (response) {
                     self.token = response.body.data.token;
                     return response;
                   });
    },

    /**
     * Verify a user
     *
     * @param {string} userId
     * @param {string} verificationHash
     * @return {promise}
     */
    verify: function (userId, verificationHash) {
      return client.put('users/' + userId + '/verify', {'verification_hash': verificationHash});
    },

    /**
     * Get users
     *
     * @return {promise}
     */
    getUsers: function() {
      return client.get('users', null, this.token);
    },

    /**
     * Get organisations
     *
     * @return {promise}
     */
    getOrganisations: function () {
      return client.get('organisations', null, this.token);
    },

    /**
     * Update an organisation
     *
     * @param {string} orgId - an existing organisation ID
     * @param {object} data - the organisation object
     * @return {promise}
     */
    updateOrganisation: function (orgId, data) {
      return client.put('organisations/' + orgId, data, this.token);
    },

    /**
     * Delete an organisation
     *
     * @param {string} orgId - an existing organisation ID
     * @return {promise}
     */
    deleteOrganisation: function (orgId) {
      return client.del('organisations/' + orgId, this.token);
    },

    /**
     * Create an organisation
     *
     * @param {object} data - the organisation object
     * @return {promise}
     */
    createOrganisation: function (data) {
      return client.post('organisations', data, this.token);
    },

    /**
     * Add an organisation ID to the user
     *
     * @param {string} orgId - an existing organisation ID
     * @param {string} userId - an existing user ID
     * @return {promise}
     */
    joinOrganisation: function (orgId, userId) {
      return client.post('users/' + userId + '/organisations', {'organisation_id': orgId}, this.token);
    },

    /**
     * Remove a user's organisation
     *
     * @param {string} userId - an existing user ID
     * @return {promise}
     */
    leaveOrganisation: function (userId, orgId) {
      return client.del('users/' + userId + '/organisations/' + orgId, this.token);
    },

    /**
     * Update the join state of a user-organisation join
     *
     * @param {string} orgId - an existing organisation ID
     * @param {string} userId - an existing user ID
     * @param {string} state - Join state to update
     * @return {promise}
     */
    updateJoinOrganisation: function (orgId, userId, state) {
      var data = {
        'state': state
      };
      return client.put('users/' + userId + '/organisations/' + orgId, data, this.token);
    },

    /**
     * Get valid service types
     *
     * @return {promise}
     */
    getServiceTypes: function () {
      return client.get('services/types');
    },

    /**
     * Get services
     *
     * @param {string} orgId - an existing organisation ID
     * @return {promise}
     */
    getServices: function (orgId) {
      var body = null;
      if (orgId) {
        body = {'organisation_id': orgId}
      }
      return client.get('services', body, this.token);
    },

    /**
     * Create a service for an organisation
     *
     * @param {string} name - the name of the service
     * @param {string} location - the URL for the service
     * @param {string} orgId - an existing organisation ID
     * @return {promise}
     */
    createService: function (name, location, serviceType, orgId) {
      var data = {'name': name, 'location': location, 'service_type': serviceType};
      return client.post('organisations/' + orgId + '/services', data, this.token);
    },

    /**
     * Update a service
     *
     * @param {string} serviceId - the ID of an existing service
     * @param {string} name - the name of the service
     * @param {string} location - the URL for the service
     * @param {string} serviceType - the service type
     * @param {string} permissions - access control permissions for service
     * @return {promise}
     */
    updateService: function (serviceId, name, location, serviceType, permissions, state) {
      var data = {
        'name': name,
        'location': location,
        'service_type': serviceType,
        'state': state
      };

      if (permissions) {
        data.permissions = permissions
      }

      return client.put('services/' + serviceId, data, this.token);
    },


    /**
     * Delete a service
     *
     * @param {string} serviceId - the ID of the service
     * @return {promise}
     */
    deleteService: function (serviceId) {
      var url = 'services/' + serviceId;
      return client.del(url, this.token);
    },

    /**
     * Create a new client secret for a service
     *
     * @param {string} serviceId - the ID of the service
     * @return {promise}
     */
    addSecret: function (serviceId) {
      return client.post('services/' + serviceId + '/secrets', null, this.token);
    },

    /**
     * Get a service's client secrets
     *
     * @param {string} serviceId - the ID of the service
     * @return {promise}
     */
    getSecrets: function (serviceId) {
      return client.get('services/' + serviceId + '/secrets', null, this.token);
    },

    /**
     * Delete a service's client secret
     *
     * @param {string} serviceId - the ID of the service
     * @param {string} secret - the client secret
     * @return {promise}
     */
    deleteSecret: function (serviceId, secret) {
      var url = 'services/' + serviceId + '/secrets/' + secret;
      return client.del(url, this.token);
    },

    /**
     * Delete all of a service's client secrets
     *
     * @param {string} serviceId - the ID of the service
     * @return {promise}
     */
    deleteSecrets: function (serviceId) {
      var url = 'services/' + serviceId + '/secrets';
      return client.del(url, this.token);
    },

     /**
     * Get roles
     *
     * @return {promise}
     */
    getRoles: function() {
      return client.get('roles', null, this.token);
    },

    /**
     * Get repositories for an organisation
     *
     * @param {string} organisationID - The id of the organisation
     * @return {promise}
     */
    getRepositories: function(organisationId) {
      if (organisationId) {
        var url = 'organisations/' + organisationId + '/repositories';
        return client.get(url, null, this.token);
      }
      return client.get('repositories', null, this.token);

    },

    /**
     * Create repository for an organisation
     *
     * @param {string} organisationId - the id of the organisation
     * @param {string} name - the name of the repository
     * @param {string} serviceId - the id of the repository service to use
     * @return {promise}
     */
    createRepository: function(organisationId, name, serviceId) {
      var url = 'organisations/' + organisationId + '/repositories';
      var data = {
        'name': name,
        'service_id': serviceId
      };
      return client.post(url, data, this.token)
    },

    /**
     * Update repository
     *
     * @param {string} repositoryId - id of repository
     * @param {string} name - name of repository
     * @param {array} permissions - access control permissions
     * @param {string} state - state of repository
     *
     */
    updateRepository: function(repositoryId, name, permissions, state) {
      var url = 'repositories/' + repositoryId;
      var data = {
        'name': name
      };

      if (permissions) {
        data.permissions = permissions;
      }

      if (state) {
        data.state = state;
      }

      return client.put(url, data, this.token)
    },

    /**
     * Delete a repository
     *
     * @param {string} repositoryId - the ID of the repository
     * @return {promise}
     */
    deleteRepository: function (repositoryId) {
      var url = 'repositories/' + repositoryId;
      return client.del(url, this.token);
    }

  };
}

module.exports = accounts;
