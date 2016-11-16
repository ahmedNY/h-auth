exports.up = function(knex, Promise) {
  return knex.schema.createTable('um_user', function(table) {
    table.increments('id').primary();
    table.string('username').unique();
    table.string('email').unique();
    table.text('password');
    table.string('display_name');
    table.string('facebook_id');
    table.string('google_id');
    table.boolean('email_activated');
    table.boolean('facebook_activated');
    table.boolean('google_activated');
  }).then(function() {
    return knex.schema.createTable('um_activation_token', function(table) {
      table.increments('id').primary();
      table.string('token');
      table.string('email');
      table.boolean('consumed');
      table.datetime('consumed_at');
      table.timestamps();
    });  
  }).then(function() {
    return knex.schema.createTable('um_permission', function(table) {
      table.increments('id').primary();
      table.string('action');
      table.string('resource');
      table.string('context');
    });
  }).then(function() {
    return knex.schema.createTable('um_role', function(table) {
      table.increments('id').primary();
      table.string('role_name').unique();
    });
  }).then(function() {
    return knex.schema.createTable('um_role_permission', function(table) {
      table.increments('id').primary();
      table.integer('role_id').unsigned().references('um_role.id');
      table.integer('permission_id').unsigned().references('um_permission.id');
    });
  }).then(function() {
    return knex.schema.createTable('um_badge', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('um_user.id');
      table.integer('role_id').unsigned().references('um_role.id');
      table.string('context');
      table.integer('context_id').unsigned();
    });
  });
};

exports.down = function(knex, Promise) {
  
};