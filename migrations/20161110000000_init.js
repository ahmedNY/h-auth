exports.up = function(knex, Promise) {
  return knex.schema.raw("CREATE VIEW `v_user_permissions` AS select `u`.`id` AS `user_id`,`u`.`username` AS `username`,`u`.`display_name` AS `display_name`,`r`.`id` AS `role_id`,`r`.`role_name` AS `role_name`,`b`.`context` AS `badge_context`,`b`.`context_id` AS `badge_context_id`,`p`.`action` AS `permission_action`,`p`.`resource` AS `permission_resource`,`p`.`context` AS `permission_context` from ((((`um_user` `u` join `um_badge` `b` on((`u`.`id` = `b`.`user_id`))) join `um_role` `r` on((`b`.`role_id` = `r`.`id`))) join `um_role_permission` `rp` on((`rp`.`role_id` = `r`.`id`))) join `um_permission` `p` on((`p`.`id` = `rp`.`permission_id`)))")
  .then(function() {
    return knex.schema.raw("CREATE VIEW `v_user_roles` AS select `u`.`id` AS `user_id`,`u`.`username` AS `username`,`u`.`display_name` AS `display_name`,`r`.`id` AS `role_id`,`r`.`role_name` AS `role_name`,`b`.`context` AS `badge_context`,`b`.`context_id` AS `badge_context_id` from ((`um_user` `u` join `um_badge` `b` on((`u`.`id` = `b`.`user_id`))) join `um_role` `r` on((`b`.`role_id` = `r`.`id`)))");
  });
};

exports.down = function(knex, Promise) {
  
};