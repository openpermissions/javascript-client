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
var repository = require('../lib/repository');

describe('repository', function () {
  var api,
      client,
      repoClient,
      baseUrl = 'http://test.com';

  beforeEach(function () {
    api = {
      get: sinon.stub().returns('get result'),
      post: sinon.stub().returns('post result'),
      put: sinon.stub().returns('put result'),
      del: sinon.stub().returns('delete result')
    };
    client = sinon.stub().returns(api);
    repoClient = repository(baseUrl, true, client);
    repoClient.token = 'token';
  });

  it('should pass the `baseUrl` and `cors` arguments to the API client', function () {
    repository(baseUrl, true);
    client.calledWith(baseUrl, true);
  });

  describe('getOffers', function () {
    it('should perform a get request', function () {
      var result = repoClient.getOffers('repositoryid');

      result.should.be.equal('get result');
      api.get.calledOnce.should.be.true;
      api.get.calledWith('repositories/repositoryid/offers', null, repoClient.token).should.be.true;
    });
  });

  describe('getOffer', function () {
    it('should perform a get request', function () {
      var result = repoClient.getOffer('repositoryid', 'offerid');

      result.should.be.equal('get result');
      api.get.calledOnce.should.be.true;
      api.get.calledWith('repositories/repositoryid/offers/offerid', null, repoClient.token).should.be.true;
    });
  });

  describe('saveOffer', function () {
    it('should perform a post request', function () {
      var result = repoClient.saveOffer('repositoryid', 'offer');

      result.should.be.equal('post result');
      api.post.calledOnce.should.be.true;
      api.post.calledWith('repositories/repositoryid/offers', 'offer', repoClient.token, 'application/ld+json').should.be.true;
    });
  });
});
