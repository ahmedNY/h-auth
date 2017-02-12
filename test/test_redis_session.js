var promise = require('bluebird');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var seneca = require('../seneca_instance');

it('create session object with user data and save it to redis', function() {
  var test_user = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    display_name: 'Administrator',
    image: 'some_path'
  };

  return seneca.actAsync({ role:'auth', model: 'session', cmd: 'createSession', user:test_user }).then(function(seneca_response){
    expect(seneca_response).to.deep.property('session.valid', true);
    expect(seneca_response).to.deep.property('session.id', test_user.id);
    expect(seneca_response).to.deep.property('session.user_id', test_user.id);
    expect(seneca_response).to.deep.property('session.email', test_user.email);
    expect(seneca_response).to.deep.property('session.display_name', test_user.display_name);
    expect(seneca_response).to.deep.property('session.image', test_user.image);
  })
});

it('set session value', function() {
  return seneca.actAsync({ role:'auth', model: 'session', cmd: 'setSession', session_id:'123', session:{msg: 'test', valid: true}})
  .then(function(seneca_response){
    expect(seneca_response).to.deep.equal({ result: 'OK' });
  })
});

it('get session value with specific session_id', function() {
  return seneca.actAsync({ role:'auth', model: 'session', cmd: 'getSession', session_id:'123'})
  .then(function(seneca_response){
    expect(seneca_response).to.have.property('session');
    expect(seneca_response.session).to.deep.equal({msg: 'test', valid: true});
  })
});

it('checks session to be valid', function() {
  return promise.props({
    valid_response: seneca.actAsync({ role:'auth', model: 'session', cmd: 'isSessionValid', session_id:'123' }),
    invalid_response: seneca.actAsync({ role:'auth', model: 'session', cmd: 'isSessionValid', session_id:'321'})
  }).then(function(responses){
      expect(responses.valid_response).to.deep.equal({valid: true});
      expect(responses.invalid_response).to.deep.equal({valid: false});
    })
});

it('delete session with specific id', function() {
  return seneca.actAsync({ role:'auth', model: 'session', cmd: 'deleteSession', session_id:'123' })
  .then(function(seneca_response){
    expect(seneca_response).to.deep.equal({result: 1});
  })
});

