var bookshelf = require('../../bookshelf');
var Models = require('../../models');
var config = require('./config');
var l = require('../../logger');
var _ = require('lodash');
var assert = require('assert');

//find the record with the email
//update the record with user info
//if some actual changes (dirty) save the record to db
//return the full user record retreived from the database

module.exports = [{
        pattern: { role: config.role, model: config.model, cmd: 'getBadgeUsers' },
        action: function (args, callback) {
            //This query gets all users with roles related to a group
            return bookshelf.knex.select('*')
                .from('v_user_roles')
                .where('badge_context', args.context)
                .andWhere('badge_context_id',args.group_id || 0)
                .then(function(records){
                    var results = { records: _.values(records) };
                    callback(null, results);
                });
        }
    }, {
        pattern: { role: config.role, model: config.model, cmd: 'addBadgeToUser' },
        action: function (args, callback) {
            //required args:
            //  args.user_id
            //  args.role_name
            //  args.context
            //  args.context_id
            return bookshelf.knex.select('id')
            .from('um_role')
            .where('role_name', args.role_name)
            .limit(1)
            .then(function(role_ids){
                assert(_.has(role_ids, '[0].id','role name not found:' + args.role_name));
                return bookshelf.knex.insert({
                    user_id: args.user_id,
                    role_id: role_ids[0].id,
                    context: args.context,
                    context_id: args.context_id
                })
                .into('um_badge')
            })
            .then(function(result){
                console.log(result)
                callback(null, {result: result});
            });
        }
    }, {
        pattern: { role: config.role, model: config.model, cmd: 'removeBadgeFromUser' },
        action: function (args, callback) {
            //This removes permission(action) to user
            //required args:
            //  args.user_id
            //  args.role_name
            //  args.context
            //  args.context_id
            return bookshelf.knex.select('id')
            .from('um_role')
            .where('role_name', args.role_name).then(function(role_ids){
                assert(_.has(role_ids, '[0].id','role name not found:' + args.role_name));
                return bookshelf.knex.delete()
                .from('um_badge')
                .where('user_id', args.user_id)
                .andWhere('role_id', role_ids[0].id)
                .andWhere('context', args.context)
                .andWhere('context_id', args.context_id)
            })
            .then(function(result){
                console.log(result)
                callback(null, {result: result});
            });
        }
    }];
