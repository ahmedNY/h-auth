var bookshelf = require('../../bookshelf');
var Models = require('../../models');
var config = require('./config');
var l = require('../../logger');
var _ = require('lodash');

//find the record with the email
//update the record with user info
//if some actual changes (dirty) save the record to db
//return the full user record retreived from the database

module.exports = [{
    pattern: { role: config.role, model: config.model, cmd:'findOrCreate' }, 
    action: function (args, callback) {
        if(!args.data.email) {
            l.log('email parameter not found');
            return callback('email parameter not found');
        }
    
        whereClause = {};
        whereClause.email = args.data.email;
    
        Models[config.model]
        .forge(whereClause)
        .fetch()
        .then(function(record) {
            if(!record || record === null) {
                l.info('User email not found, creating new user record:' + args.data.email );
                var values = _.pick(args.data, ['email','facebook_id','display_name']);
                record = Models[config.model].forge();
            }

            // console.log(args.data);
            // console.log(record);
            
            record.set('facebook_activated', 1);
            if(args.data.facebook_id) {
                record.set('facebook_id', args.data.facebook_id);
            }
    
            if(args.data.google_id) {
                record.set('google_id', args.data.google_id);
            }
    
            if(args.data.email) {
                record.set('email', args.data.email);
            }
    
            if(args.data.username) {
                record.set('username', args.data.username);
            }
    
            if(args.data.display_name) {
                record.set('display_name', args.data.display_name);
            }
        
            if(record.hasChanged()){
                l.info('Saving user data to db: ' + args.data.email);
                return record.save();
            } else {
                return record;
            }
        
        }).then(function(savedUser){
            return callback(null, { user: savedUser} );
        });
      }
    }, {
        pattern: { role: config.role, model: config.model, cmd:'validate' }, 
        action: function (args, callback) {        
            Models[config.model].login(args.data)
            .then(function(foundUser) {
                var tray = {};
                tray.user = foundUser.toJSON();
                tray.user = _.omit(tray.user, 'password') ;
                return callback(null, tray);

            }).catch(function(err){
                console.log(err);
                return callback(err);
            });
        }
    }, {
        pattern: { role: config.role, model: config.model, cmd: 'getUserPermissions' },
        action: function (args, callback) {
            Models[config.model].getAvailablePermissions(args.user_id).then(function(permissions){
                var tray = {};
                tray.permissions = permissions;
                console.log(tray);
                return callback(null, tray);
            });
        }
    }, {
        pattern: { role: config.role, model: config.model, cmd: 'hasPermission' },
        action: function (args, callback) {
            //required args:
            //  args.user_id
            //  args.action
            //  args.resource
            //  args.context
            //  args.context_id
            l.info('Checking permission for user:', {user_id: args.user_id, action: args.action, resource: args.resource, context: args.context, context_id: args.context_id});
            bookshelf.knex.raw("SELECT \
                u.id as user_id, u.username, u.display_name, \
                r.id as role_id, r.role_name, \
                b.context badge_context, b.context_id as badge_context_id, \
                p.action permissin_action, p.resource permission_resource, p.context permission_context \
            FROM um_user u \
            JOIN um_badge b on u.id = b.user_id \
            JOIN um_role r on b.role_id = r.id \
            JOIN um_role_permission rp on rp.role_id = r.id \
            JOIN um_permission p on p.id = rp.permission_id \
            WHERE u.id = ? AND p.`action`=? AND p.resource=? AND b.context = ? AND b.context_id = ?",
            [args.user_id, args.action, args.resource, args.context, args.context_id])
            .then(function(records){
                l.info('Permission Record:', records[0]);
                var results = {answer: records[0].length > 0};
                l.info('Sending Results', results);
                callback(null, results);
            });
        }
    }, {
        pattern: { role: config.role, model: config.model, cmd: 'getGroupUsers' },
        action: function (args, callback) {
            //This query gets all users with roles related to a group
            return bookshelf.knex.select('*')
                .from('v_user_roles')
                .where('badge_context', 'group')
                .andWhere('badge_context_id',args.group_id || 0)
                .then(function(records){
                    var results = { records: _.values(records) };
                    callback(null, results);
                });
        }
    }];
