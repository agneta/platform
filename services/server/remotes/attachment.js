module.exports = function(Model, app) {


  require('./attachment/generateMethod')(Model, app);
  require('./attachment/saveFile')(Model, app);

};
