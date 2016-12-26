var chai = require('chai');
var expect = require('chai').expect;
var seneca = require('../seneca_instance');
var promise = require('bluebird');
var _ = require('lodash');

var foo = 'bar';
var beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

expect(foo).to.be.a('string');
expect(foo).to.equal('bar');
expect(foo).to.have.length(3);
expect(beverages).to.have.property('tea').with.length(3);

promise.props({
  addBadge: seneca.actAsync({ role: 'auth', model:'badge', cmd: 'removeBadgeFromUser', user_id:3 , role_name:'GroupAdmin', context:'group', context_id:'1' })
})
.then(function(seneca_responses){
    console.log(seneca_responses)
})
.catch(function(err){
    console.log(err)
});