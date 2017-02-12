var glob = require("glob");
var l = require('./logger.js');
var _ = require('lodash');

glob("./models/*.js", {}, function (err, files) {
  // files is an array of filenames.
  _.each(files, function(file){
    var model_name = _.camelCase(file);
    model_name = _.replace(model_name, "models","");
    model_name = _.replace(model_name, "Js", "");
    model_name = _.snakeCase(model_name);
    module.exports[model_name] = require(file);
    l.info("Loaded model:", model_name, "from", file);
  });
});