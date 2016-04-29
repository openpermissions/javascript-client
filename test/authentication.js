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
var authentication = require('../lib/authentication');

describe('authentication', function () {
  var api,
      client,
      authClient,
      baseUrl = 'http://test.com';

  beforeEach(function () {
    api = {
      get: sinon.stub().returns('get result'),
      post: sinon.stub().returns('post result'),
      put: sinon.stub().returns('put result'),
      del: sinon.stub().returns('delete result')
    };
    client = sinon.stub().returns(api);
    authClient = authentication(baseUrl, true, client);
    authClient.token = 'token';
  });

  it('should pass the `baseUrl` and `cors` arguments to the API client', function () {
    authentication(baseUrl, true);
    client.calledWith(baseUrl, true);
  });

  describe('getToken', function () {
    it('should perform a post request', function () {
      var result = authClient.getToken('clientid', 'clientsecret');

      result.should.be.equal('post result');
      api.post.calledOnce.should.be.true;
    });

    it('should include optional scope if included', function () {
      var result = authClient.getToken('clientid', 'clientsecret', 'read');

      var token = 'Basic ' + btoa('clientid:clientsecret');
      var body = 'grant_type=client_credentials&scope=read';
      api.post.calledWith('token', body, token).should.be.true;
    });

    it('should leave out optional keys if not provided', function () {
      var result = authClient.getToken('clientid', 'clientsecret');

      var token = 'Basic ' + btoa('clientid:clientsecret');
      var body = 'grant_type=client_credentials';
      api.post.calledWith('token', body, token).should.be.true;
    });
  });
});
