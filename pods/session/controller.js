var bookshelf     = require('../../bookshelf');
var Models        = require('../../models');
var config        = require('./config');
var aguid         = require('aguid');  // https://github.com/ideaq/aguid
var global_config = require('config');
var timeout       = global_config.get('session.timeout');

// preparing redis client connection
var redisClient = require('redis-connection')(); // instantiate redis-connection

redisClient.set('redis', 'working');
redisClient.get('redis', function (redisError, redisValue) {
  /* istanbul ignore if */
  if(redisError) {
    l.info(redisError);
  }
  l.info('redis is ' + redisValue.toString()); // confirm we can access redis
});





module.exports = [
 {
    pattern: { role: config.role, model: config.model, cmd:'createSession' },
    action: function (args, callback) {
      //create new session
      var session = {
        valid: true, // this will be set to false when the person logs out
        session_id: aguid(), // a random session id
        user_id: args.user.id,
        id: args.user.id,
        username: args.user.username,
        email: args.user.email,
        display_name: args.user.display_name,
        image: args.user.image
      };

      //create the session in Redis
      redisClient.set(session.session_id, JSON.stringify(session), function (redisError, redisResult){
        
        //check redis error
        if(redisError) {
          l.error('createSession(): could not get session due to redis error', redisError);
          return callback(redisError);
        }

        redisClient.expire(session.session_id, timeout) // expires in 30 minutes

        l.debug('createSession(): Created new session for user:', session);
        callback(null, {session: session});
      });
    }
  }, 
  {
    pattern: { role: config.role, model: config.model, cmd:'getSession' }, 
    action: function (args, callback) {

        redisClient.get(args.session_id, function (redisError, redisValue) {
            //check redis error
            if(redisError) {
              l.error('getSession(): could not get session due to redis error  ', redisError);
            }

            
            //check redisValue value
            if(!redisValue) {
              l.debug('validateJWT: session value return from redis is null', redisValue);
              return callback(redisError, redisValue);
            }

            var session = JSON.parse(redisValue);
            return callback(null, {session: session});
        });
      }
    }, {
        pattern: { role: config.role, model: config.model, cmd:'isSessionValid' }, 
        action: function (args, callback) {
            redisClient.get(args.session_id, function (redisError, redisValue) {
                //check redis error
                if(redisError) {
                  l.error('validateJWT(): could not get session due to redis error', redisError);
                  return callback(redisError);
                }

                redisClient.expire(args.session_id, timeout) // expires in 30 minutes

                //check redisValue value
                if(!redisValue) {
                  l.debug('validateJWT(): session value return from redis is null', redisValue);
                  return callback(null, {valid: false});
                }

                var session = JSON.parse(redisValue);

                if (session.valid === true) {
                  return callback(null, {valid: true});
                } else {
                  return callback(null, {valid: false});
                }
            });
          }
    }, {
        pattern: { role: config.role, model: config.model, cmd:'setSession' }, 
        action: function (args, callback) {
          redisClient.set(args.session_id, JSON.stringify(args.session), function (redisError, redisResult){
            //check redis error
            if(redisError) {
              l.error('setSession(): could not get session due to redis error', redisError);
              return callback(redisError);
            }

            callback(null, {result: redisResult});
          });
        }
    }, {
        pattern: { role: config.role, model: config.model, cmd: 'deleteSession' },
        action: function (args, callback) {
            l.debug('deleteSession: deleting session from redis', args.session_id);
            redisClient.del(args.session_id, function(redisError, redisResult){
              //check redis error
              if(redisError) {
                l.error('setSession(): could not get session due to redis error', redisError);
                return callback(redisError);
              }

              callback(null, {result: redisResult});
            });
        }
    }];
