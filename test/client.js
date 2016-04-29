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
/*global describe, it, beforeEach, afterEach */
/*jshint -W030 */
var should = require('should');
var sinon = require('sinon');
var request = require('superagent');
var client = require('../lib/client');
var baseUrl = 'http://test.com';
var path = 'test';
var url = 'http://test.com/test';

function testMethod (method) {
  return function () {
    var req;

    beforeEach(function () {
      req = {
        query: sinon.stub().returns(req),
        send: sinon.stub().returns(req),
        set: sinon.stub().returns(req),
        withCredentials: sinon.stub().returns(req),
        promise: sinon.stub().returns('this is a promise')
      };
      sinon.stub(request, method).returns(req);
    });

    afterEach(function () {
      request[method].restore();
    });

    it('should call superagent\'s ' + method + ' method', function () {
      var api = client(baseUrl);
      var result = api[method](path);

      request[method].calledOnce.should.be.true;
    });

    it('should return a Promise', function () {
      var api = client(baseUrl);
      var result = api[method](path);

      result.should.equal('this is a promise');
    });

    it('should join the baseUrl and path', function () {
      var api = client(baseUrl);
      var result = api[method](path);

      request[method].calledWith(url).should.be.true;
    });

    it('should set the Authorization header if a token is provided', function () {
      var api = client(baseUrl);
      var result;
      if (method !== 'del') {
        result = api[method](path, {}, 'token');
      } else {
        result = api[method](path, 'token');
      }

      req.set.calledWith('Authorization', 'token').should.be.true;
    });

    it('should not set the Authorization header unless a token is provided', function () {
      var api = client(baseUrl);
      var result = api[method](path);

      req.set.calledOnce.should.be.false;
    });

    if (method === 'get') {
      it('should send a query string if provided', function () {
        var data = {key: 'value'};
        var api = client(baseUrl);
        var result = api[method](path, data);

        req.query.calledWith(data).should.be.true;
        req.send.calledOnce.should.be.false;
      });
      it('should not send a query string unless provided', function () {
        var api = client(baseUrl);
        var result = api[method](path);

        req.query.calledOnce.should.be.false;
        req.send.calledOnce.should.be.false;
      });
    }

    if (method !== 'get' && method !== 'del') {
      it('should send data if provided', function () {
        var data = {key: 'value'};
        var api = client(baseUrl);
        var result = api[method](path, data);

        req.send.calledWith(data).should.be.true;
        req.query.calledOnce.should.be.false;
      });

      it('should not send data unless provided', function () {
        var api = client(baseUrl);
        var result = api[method](path);

        req.send.calledOnce.should.be.false;
        req.query.calledOnce.should.be.false;
      });
    }

    it('should call withCredentials if `cors` is true', function () {
      var api = client(baseUrl, true);
      var result = api[method](path);

      req.withCredentials.calledOnce.should.true;
    });

    it('should not call withCredentials if `cors` is false', function () {
      var api = client(baseUrl, false);
      var result = api[method](path);

      req.withCredentials.calledOnce.should.false;
    });
  };
}

describe('API', function () {
  it('should have baseUrl set', function () {
    var api = client(baseUrl);
    api.baseUrl.should.equal(baseUrl);
  });

  describe('get', testMethod('get'));
  describe('post', testMethod('post'));
  describe('put', testMethod('put'));
  describe('patch', testMethod('patch'));
  describe('head', testMethod('head'));
  describe('del', testMethod('del'));
});
