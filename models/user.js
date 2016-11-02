var Fields = require('bookshelf-schema/lib/fields');
var bookshelf = require('../bookshelf');
var ActivationToken = require('./activation_token');
var rstring = require('randomstring');
var Promise = require('bluebird');
var l = require('../logger');
var _ = require('lodash');

module.exports = bookshelf.Model.extend({ 
  tableName: 'um_user'
}, {
  schema: [
    Fields.StringField('email'),
    Fields.StringField('username'),
    Fields.EncryptedStringField('password', {keylen: 1, saltLength: 1, iterations: 3}),
    Fields.StringField('facebook_id'),
    Fields.StringField('google_id'),
    Fields.BooleanField('email_activated'),
    Fields.BooleanField('facebook_activated'),
    Fields.BooleanField('google_activated')
  ],

  generateActivationToken: Promise.method(function(email) {
    if (!email) {
      throw new Error('Email is required');
    }

    //load user
    return this.forge({email: email.toLowerCase().trim()}).fetch({require: true}).then(function(foundUser) {
      return ActivationToken
      .forge({email: foundUser.get('email'), token: rstring.generate(128), consumed: false})
      .save()
      .then(function(savedToken){
        //prepare email
        var link = "http://hlab.local/user/activate?token=" + savedToken.get('token');
        var body = "Thank you for registeration to HLAB. \
                    For login, please click here: <br> \
                    <a href='" + link + "'>" + link + "<a>";
        l.info('token generated for: ' + foundUser.get('email'));
        //load mail library
        //send activation email
        //sendEmail(user.get('email'), body);
      });
    });
  }),

  //params: {username:'', email:'', password:''}
  //throws exceptions
  //returns found user
  login: Promise.method(function(params) {

    if (!params.email && !params.username) {
      l.error('User.login: Email Or Username is required');
      throw new Error('User.login: Email Or Username is required');
    }

    if (!params.password) {
      l.error('User.login: Password is required');
      throw new Error('User.login: Password is required');
    }

    whereClause = _.pick(params, ['username', 'email']);
    whereClause.email_activated = 1;

    return this.forge(whereClause)
    .fetch()
    .then(function(foundUser) {
      if(foundUser){
        l.info('User Found');
        return foundUser.password.verify(params.password).then(function(isValid){
          if (isValid) {
            l.info('Valid Password');
            return foundUser;
          } else {
            l.warn('Invalid Password');
            throw new Error('Invalid password');
          }
        });
      } else {
        l.warn('User Not Found');
        throw new Error('User not found');
      }
    });
  }),

  getAvailablePermissions: Promise.method(function(user_id){
    return bookshelf.knex.select('*').from('v_user_permissions').where('user_id',user_id).then(function(permissions){
      return permissions;
    }).catch(function(err){
      l.error(err);
      l.warn('User.login: Error during retreiving user permissions');
      throw new Error('User.login: Error during retreiving user permissions');
    });
  }),

  loginByFacebook: Promise.method(function(email, password) {
  }),

  loginByGoogle: Promise.method(function(email, password) {
  }),

  consumeActivationToken: Promise.method(function(token) {
    var User = this;

    if (!token) {
      throw new Error('token is required');
    }
    
    //load the ActivationToken
    ActivationToken.forge({token: token}).fetch({require: true}).then(function(foundActivationToken) {
      //load the User
      return User.forge({email: foundActivationToken.get('email')}).fetch({require: true}).then(function(foundUser){
        //updating both activationToken and user
        return Promise.all([
          foundActivationToken.save({consumed: true, consumed_at: new Date()}, {patch: true}),
          foundUser.save({'email_activated': true}, {patch: true})
        ]).then(function(results){
          return foundUser.get('email');
        });
      });
    }).then(function(email){
      l.info('Account Activated: ', email);
    });
  })

});