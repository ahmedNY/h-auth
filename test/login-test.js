// file: test/color-test.js
var Lab = require('lab')
var Code = require('code')
var Seneca = require('seneca')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var expect = Code.expect

function test_seneca (fin) {
  return Seneca({log: 'test'})

  // activate unit test mode. Errors provide additional stack tracing context.
  // The fin callback is called when an error occurs anywhere.
    .test(fin)

  // Load the microservice business logic
    .use(require('../index'))
}

describe('color', function () {

  it('login system user, and status should b', function (fin) {
    var seneca = test_seneca(fin)

    seneca.act({
      role: 'color',
      to: 'hex',
      color: 'red'
    }, function (ignore, result) {
      expect(result.hex).to.equal('FF0000')
      fin()
    })
  })

})