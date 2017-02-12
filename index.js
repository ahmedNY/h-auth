var u = require('./utils');
var fs = require('fs');
var glob = require('glob');
var seneca = require('seneca')();
var global_config = require('config');
var mainController = require('./lib/controller');
var models = require("./models");
var path = require('path');

global.appRoot = path.resolve(__dirname);
global._ = require('lodash');
global.l = require('./logger');
global.promise = require('bluebird');

var configs = [];
var controllers = [];

glob("./models/*.js", {}, function (er, files) {
  // files is an array of filenames.
  _.each(files, function(file){
    var model_name = _.camelCase(file);
    model_name = _.replace(model_name, "models","");
    model_name = _.replace(model_name, "Js", "");
    model_name = _.snakeCase(model_name);
    l.info("Generating controllers for model:", model_name, "from", file);
    
    //try loading configuration file
    var config;
    var config_path = './pods/' + model_name + '/config.js';
    
    try {
      config = require(config_path);
      l.info(" - Loaded config file from", config_path);
      //check if model value exsists, if not set to default one
      if(!config.model) {
        config.role = global_config.get('seneca.role');
      }
      if(!config.model) {
        config.model = model_name;
      }
      if(!config.limit) {
        config.limit = global_config.get('seneca.limit');
      }
    } catch (e) {
      l.info(" - Generated config for model", model_name);
      config = {
        role: global_config.get('seneca.role'),
        model: model_name,
        limit: global_config.get('seneca.limit')
      };
    }
    
    var controllers = mainController(config);
    _.each(controllers, function(controller){
      seneca.add(controller.pattern, controller.action);
      l.info(' - Injecting Seneca Pattern', controller.pattern, 'for model:', model_name);
    });

  });
});

glob("./pods/*/controller.js", {}, function (er, files) {
  //each file exports array of controllers
  _.each(files, function(file){
    var controllers = require(file);
    l.info("Loaded", controllers.length, "controllers from file:", file);
    _.each(controllers, function(controller){
      seneca.add(controller.pattern, controller.action);
      l.info(' - Added Seneca Pattern', controller.pattern);
    });
  });
});

seneca.listen(global_config.get('seneca.port'));