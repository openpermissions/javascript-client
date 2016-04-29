Open Permissions Platform JavaScript Client
===========================================

A client library to interface with the Open Permissions Platform RESTful services.

The library is a simple wrapper around [superagent](https://github.com/visionmedia/superagent)
and uses [bluebird](https://github.com/petkaantonov/bluebird) for promises.


Usage
-----


### Accounts

Each method returns a promise. Methods that modify a resource (other than creating
a new user) require an authentication token, which can be retreived by using the
`login` method.

Examples:

```javascript
var api = require('chub');
// initialise with the base URL for the accounts service
var accounts = api.accounts('https://localhost:8006/v1/accounts');

// create a user
var promise = accounts.createUser({'email': 'user@test.com', 'password': 'password'});

// login and create an organiastion
accounts.login({'email': 'user@test.com', 'password': 'password'})
        .then(function (res) {
            return accounts.createOrganisation('Test Org', res.body.token);
        });
```

Unlike superagent, 4xx and 5xx response codes are treated as errors, and the
response is included in the error's `response` property, e.g.

```javascript
// try creating an organisation with an invalid token
accounts.createOrganisation('Another Org', 'not a valid token')
        .catch(function (err) {
            if (err.response.status === 401) {
                console.log('Authentication failed');
            }
        });
```

### Base API Client

You can easiliy make requests using the underlying superagent wrapper if
necessary:

```javascript
// initialise a client with the base URL for the accounts service
var client = api.client('https://localhost:8006/v1/accounts');

// create a user
promise = client.post('users', {'email': 'other_user@test.com', 'password': 'password'});
```

Installation
------------

Run `npm install git+ssh://git@github.com:openpermissions/javascript-client.git`

Tests
-----

There are some [mocha](http://mochajs.org/) unit tests in the "test" directory.
They can be run with the `npm test` command.
