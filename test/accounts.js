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
/*global describe, it, before */
/*jshint -W030 */
var should = require('should');
var sinon = require('sinon');
var request = require('superagent');
var accounts = require('../lib/accounts');

describe('accounts', function () {
  var api,
      client,
      accountsClient,
      baseUrl = 'http://test.com';

  beforeEach(function () {
    api = {
      get: sinon.stub().returns('get result'),
      post: sinon.stub().returns('post result'),
      put: sinon.stub().returns('put result'),
      del: sinon.stub().returns('delete result')
    };
    client = sinon.stub().returns(api);
    accountsClient = accounts(baseUrl, true, client);
    accountsClient.token = 'token';
  });

  it('should pass the `baseUrl` and `cors` arguments to the API client', function () {
    accounts(baseUrl, true);
    client.calledWith(baseUrl, true).should.be.true;
  });

  describe('createUser', function () {
    it('should perform a post request', function () {
      var result = accountsClient.createUser('user@test.com',
                                             'password',
                                             true,
                                             'test',
                                             'user',
                                             '1234567890');

      result.should.be.equal('post result');
      api.post.calledOnce.should.be.true;
    });

    it('should include optional arguments if included', function () {
      var result = accountsClient.createUser('user@test.com',
                                             'password',
                                             true,
                                             'test',
                                             'user',
                                             '1234567890');

      var data = {
        'email': 'user@test.com',
        'password': 'password',
        'has_agreed_to_terms': true,
        'first_name': 'test',
        'last_name': 'user',
        'phone': '1234567890'
      };
      api.post.calledWith('users', data).should.be.true;
    });

    it('should leave out optional keys if not provided', function () {
      var result = accountsClient.createUser('user@test.com', 'password', true);

      var data = {
        email: 'user@test.com',
        password: 'password',
        has_agreed_to_terms: true
      };
      api.post.calledWith('users', data).should.be.true;
    });
  });

  describe('updateUser', function () {
    it('should perform a put request', function () {
      var result = accountsClient.updateUser(
        'user1',
        'user@test.com',
        'test',
        'user',
        '1234567890'
      );

      result.should.be.equal('put result');
      api.put.calledOnce.should.be.true;
    });
    it('should include optional arguments if included', function () {
      var result = accountsClient.updateUser(
        'user1',
        'user@test.com',
        'test',
        'user',
        '1234567890'
      );

      var data = {
        'email': 'user@test.com',
        'first_name': 'test',
        'last_name': 'user',
        'phone': '1234567890'
      };
      api.put.calledWith('users/user1', data, 'token').should.be.true;
    });

    it('should leave out optional keys if not provided', function () {
      var result = accountsClient.updateUser('user1', 'user@test.com');

      var data = {
        email: 'user@test.com'
      };
      api.put.calledWith('users/user1', data, 'token').should.be.true;
    });
  });

  describe('deleteUser', function () {
    it('should delete a user', function () {
      var result = accountsClient.deleteUser('user1');

      result.should.be.equal('delete result');
      api.del.calledWith('users/user1', 'token').should.be.true;
    });
  });

  describe('login', function () {
    it('should post email and password to login', function () {
      api.post = sinon.stub().returns({then: function (callback) {
        callback({'body': {'data': {'token': 'test token'}}});
        return 'post result'
      }});

      client = sinon.stub().returns(api);
      accountsClient = accounts(baseUrl, true, client);

      var result = accountsClient.login('user@test.com', 'password');

      var data = {
        email: 'user@test.com',
        password: 'password'
      };
      result.should.be.equal('post result');
      api.post.calledWith('login', data).should.be.true;
      accountsClient.token.should.be.equal('test token');
    });
  });

  describe('verify', function () {
    it('should verify a user', function () {
      var result = accountsClient.verify('user1', '12345');

      var data = {
        verification_hash: '12345'
      };
      result.should.be.equal('put result');
      api.put.calledWith('users/user1/verify', data).should.be.true;
    });
  });

  describe('changePassword', function () {
    it('should put previous and new password', function () {
      var result = accountsClient
        .changePassword('user1', 'old password', 'new password');

      var data = {
        previous: 'old password',
        password: 'new password'
      };
      result.should.be.equal('put result');
      api.put.calledWith('users/user1/password', data, 'token').should.be.true;
    });
  });
  describe('getUsers', function() {
    it('should get all users', function () {
      var result = accountsClient.getUsers();

      result.should.be.equal('get result');
      api.get.calledWith('users', null, 'token').should.be.true;
    });
  });

  describe('updateUserRole', function() {
    var data = {
      'role': 'role1'
    };

    it('should perform a put request when updating a user organisation role', function() {
      var result = accountsClient.updateUserRole('user1', 'role1', 'org1');
      result.should.be.equal('put result');
      api.put.calledWith('users/user1/organisations/org1', data, 'token').should.be.true;
    });
    it('should perform a post request when updating a user role with null organisation', function () {
      var result = accountsClient.updateUserRole('user1', 'role1', null);
      result.should.be.equal('post result');
      api.post.calledWith('users/user1/roles', data, 'token').should.be.true;
    });
  });

  describe('getOrganisations', function () {
    it('should get all organisations', function () {
      var result = accountsClient.getOrganisations();

      result.should.be.equal('get result');
      api.get.calledWith('organisations', null, 'token').should.be.true;
    });
  });

  describe('updateOrganisation', function () {
    it('should put organisation data, with auth token', function () {
      var data = {
        name: 'name2',
        description: 'description2',
        address: 'address2',
        phone:  'phone2',
        email:  'email2',
        website:  'website2',
        facebook:  'facebook2',
        twitter:  'twitter2',
        google_plus:  'googlePlus2',
        instagram:  'instagram2',
        youtube:  'youtube2',
        linkedin:  'linkedin2',
        myspace:  'myspace2'};

      var result = accountsClient.updateOrganisation('orgId', data);

      result.should.be.equal('put result');
      api.put.calledWith('organisations/orgId', data, 'token').should.be.true;
    });
  });

  describe('deleteOrganisation', function () {
    it('should delete a organisation', function () {
      var result = accountsClient.deleteOrganisation('org1');

      result.should.be.equal('delete result');
      api.del.calledWith('organisations/org1', 'token').should.be.true;
    });
  });

  describe('createOrganisation', function () {
    it('should post organisation data, with auth token', function () {
      var data = {
        name: 'name1',
        description: 'description1',
        address: 'address1',
        phone: 'phone1',
        email: 'email1',
        website: 'website1',
        facebook: 'facebook1',
        twitter: 'twitter1',
        google_plus: 'googlePlus1',
        instagram: 'instagram1',
        youtube: 'youtube1',
        linkedin: 'linkedin1',
        myspace: 'myspace1'};

      var result = accountsClient.createOrganisation(data);

      result.should.be.equal('post result');
      api.post.calledWith('organisations', data, 'token').should.be.true;
    });
  });

  describe('joinOrganisation', function () {
    it('should post organisation id to user, with auth token', function () {
      var result = accountsClient.joinOrganisation('org1', 'user1');

      var data = {'organisation_id': 'org1'};
      result.should.be.equal('post result');
      api.post.calledWith('users/user1/organisations', data, 'token').should.be.true;
    });
  });

  describe('updateJoinOrganisation', function() {
    var data = {
      'state': 'approved'
    };
    it('should perform a put request when updating a user organisation join', function() {
      var result = accountsClient.updateJoinOrganisation('org1', 'user1', 'approved');
      result.should.be.equal('put result');
      api.put.calledWith('users/user1/organisations/org1', data, 'token').should.be.true;
    });
  });

  describe('leaveOrganisation', function () {
    it('should delete user organisation, with auth token', function () {
      var result = accountsClient.leaveOrganisation('userid', 'orgid');

      result.should.be.equal('delete result');
      api.del.calledWith('users/userid/organisations/orgid', 'token').should.be.true;
    });
  });

    describe('getServiceTypes', function () {
    it('should get an array of valid service types', function () {
      var result = accounts(baseUrl, true, client).getServiceTypes();

      result.should.be.equal('get result');
      api.get.calledWith('services/types').should.be.true;
    });
  });

  describe('getServices', function () {
    it('should get the services', function () {
      var result = accountsClient.getServices();

      result.should.be.equal('get result');
      api.get.calledWith('services', null, 'token').should.be.true;
    });
  });


  describe('getServices with org id', function () {
    it('should get the organisation services', function () {
      var result = accountsClient.getServices('orgid');

      var data = {'organisation_id': 'orgid'};
      result.should.be.equal('get result');
      api.get.calledWith('services', data, 'token').should.be.true;
    });
  });

  describe('createService', function () {
    it('should post service name & location, with auth token', function () {
      var result = accountsClient.createService('test', 'http://test.com', 'index', 'orgid');

      var data = {
        'name': 'test',
        'location': 'http://test.com',
        'service_type': 'index',
      };
      result.should.be.equal('post result');
      api.post.calledWith('organisations/orgid/services', data, 'token').should.be.true;
    });
  });

  describe('deleteService', function () {
    it('should delete a service', function () {
      var result = accountsClient.deleteService('service-id');

      result.should.be.equal('delete result');
      api.del.calledWith('services/service-id', 'token').should.be.true;
    });
  });

  describe('updateService', function () {
    it('should put service name, service type & location, with auth token', function () {
      var result = accountsClient.updateService(
        'service-id',
        'test',
        'http://test.com',
        'index',
        undefined,
        'pending'
      );

      var data = {
        'name': 'test',
        'location': 'http://test.com',
        'service_type': 'index',
        'state': 'pending'
      };
      result.should.be.equal('put result');
      api.put.calledWith('services/' + 'service-id', data, 'token').should.be.true;
    });
  });

  describe('updateService with permissions', function () {
    it('should put service name, service type, location and permissions, with auth token', function () {
      var result = accountsClient.updateService(
        'service-id',
        'test',
        'http://test.com',
        'index',
        [[{'service_id': 'service_1'}, 'r']],
        'pending');

      var data = {
        'name': 'test',
        'location': 'http://test.com',
        'service_type': 'index',
        'permissions': [[{'service_id': 'service_1'}, 'r']],
        'state': 'pending'
      };
      result.should.be.equal('put result');
      api.put.calledWith('services/' + 'service-id', data, 'token').should.be.true;
    });
  });

  describe('addSecret', function () {
    it('should post a service client secret', function () {
      var result = accountsClient.addSecret(
        'service');
      result.should.be.equal('post result');
      api.post.calledWith('services/service/secrets', null, 'token').should.be.true;
    });
  });

  describe('getSecrets', function () {
    it('should get service client secrets', function () {
      var result = accountsClient.getSecrets('service');

      result.should.be.equal('get result');
      api.get.calledWith('services/service/secrets', null, 'token').should.be.true;
    });
  });

  describe('deleteSecret', function () {
    it('should delete a service client secret', function () {
      var result = accountsClient.deleteSecret('service', 'secret1');

      result.should.be.equal('delete result');
      api.del.calledWith('services/service/secrets/secret1', 'token').should.be.true;
    });
  });

  describe('deleteSecrets', function () {
    it('should delete all of a service\'s client secrets', function () {
      var result = accountsClient.deleteSecrets('service');

      result.should.be.equal('delete result');
      api.del.calledWith('services/service/secrets', 'token').should.be.true;
    });
  });

  describe('getRoles', function() {
    it('should get all roles', function () {
      var result = accountsClient.getRoles();

      result.should.be.equal('get result', null, 'token');
      api.get.calledWith('roles').should.be.true;
    });
  });

  describe('getRepositories', function() {
    it('should get all repositories for an organisation', function() {
      var result = accountsClient.getRepositories('orgId');

      result.should.be.equal('get result');
      api.get.calledWith('organisations/orgId/repositories').should.be.true;
    });
    it('should get all repositories', function() {
      var result = accountsClient.getRepositories();

      result.should.be.equal('get result');
      api.get.calledWith('repositories').should.be.true;
    });
  });

  describe('createRepository', function() {
    it('should create a repository with given information', function() {
      var result = accountsClient.createRepository('orgId', 'name', 'serviceId');
      result.should.be.equal('post result');

      var data = {'name': 'name', 'service_id': 'serviceId'};
      api.post.calledWith('organisations/orgId/repositories', data, 'token').should.be.true;
    });
  });

  describe('updateRepository', function() {
    it('should update repository with name', function () {
      var result = accountsClient.updateRepository('repoId', 'name', null, null);

      result.should.be.equal('put result');
      var data = {'name': 'name'};
      api.put.calledWith('repositories/repoId', data, 'token').should.be.true
    });
    it('should update repository with name and permissions', function () {
      var result = accountsClient.updateRepository('repoId', 'name', ['permissions'], null);

      result.should.be.equal('put result');
      var data = {
        'name': 'name',
        'permissions': ['permissions']
      };
      api.put.calledWith('repositories/repoId', data, 'token').should.be.true
    });
    it('should update repository with name and state', function () {
      var result = accountsClient.updateRepository('repoId', 'name', null, 'approved');

      result.should.be.equal('put result');
      var data = {
        'name': 'name',
        'state': 'approved'
      };
      api.put.calledWith('repositories/repoId', data, 'token').should.be.true
    });
    it('should update repository with name, permission and state', function () {
      var result = accountsClient.updateRepository('repoId', 'name', ['permissions'], 'approved');

      result.should.be.equal('put result');
      var data = {
        'name': 'name',
        'permissions': ['permissions'],
        'state': 'approved'
      };
      api.put.calledWith('repositories/repoId', data, 'token').should.be.true
    });
    describe('deleteRepository', function () {
      it('should delete a repository', function () {
        var result = accountsClient.deleteRepository('repo-id');

        result.should.be.equal('delete result');
        api.del.calledWith('repositories/repo-id', 'token').should.be.true;
      });
    });
  })
});
