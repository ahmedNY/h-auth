exports.seed = function(knex, Promise) {
    return Promise.all([
        knex('um_permission').insert({id: 1, action: 'manage', resource: 'system'}),
        knex('um_permission').insert({id: 2, action: 'manage', resource: 'group'}),

        knex('um_role').insert({id: 1, role_name: 'Administrator'}),
        knex('um_role').insert({id: 2, role_name: 'GroupAdmin'}),
        
        knex('um_role_permission').insert({role_id:1, permission_id: 1}),
        knex('um_role_permission').insert({role_id:2, permission_id: 2}),

        knex('um_badge').insert({user_id: 1, role_id: 1}),
        knex('um_badge').insert({user_id: 2, role_id: 2, context:'group', context_id:2}),
    ]).then(function(result){
        console.log('Done');
    });;
};