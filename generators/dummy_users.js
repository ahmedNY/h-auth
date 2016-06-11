var u = require('../utils');
var l = require('../logger');
var _ = require('lodash');

var models = require('../models');

var config = require('config');
var db_config = config.get('knex');
var knex = require('knex')(db_config);

l.info("Database Server Configuration:", db_config);


var count = 20;
var records = [];
var record;

var firstNames = [
  'محمد',
  'احمد',
  'عمر',
  'رجب',
  'خالد',
  'عثمان',
  'بشير',
  'يحي',
  'مهند',
  'عبدالله',
  'عز الدين',
  'عبدالعزيز',
  'محمود',
  'العمدة',
  'عائشة',
  'هنادي',
  'سارة',
  'هناد',
  'كوثر',
  'فيحاء',
  'فاطمة',
  'خديجة'
];

var lastNames = [
  'محمد',
  'احمد',
  'عمر',
  'رجب',
  'خالد',
  'عثمان',
  'بشير',
  'عبدالله',
  'يسري',
  'احمد',
  'الريح',
  'خليفة',
  'علي',
  'هشام',
  'امين',
  'جمال',
  'خضر',
  'خمسي',
  'عز الدين',
  'عبدالعزيز',
  'محمود',
  'العمدة'
];

function updateUserID(savedUser){
  return knex('um_user').update({id: savedUser.get('username').replace('user','')}).where('id',savedUser.get('id'));
}

function doExecute() {
  for(i = 1000 ; i <= 1019 ; i++){
    models.user.forge({
      username: 'user' + i,
      email: 'user' + i + '@example.com', 
      display_name: u.getRandomElement(firstNames) + ' ' + u.getRandomElement(lastNames),
      password: '1234',
      email_activated: 1
    }).save().then(updateUserID);
  }
}

setTimeout(doExecute, 500);
