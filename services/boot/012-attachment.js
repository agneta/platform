
module.exports = function(app) {

  var data = {};
  require('./attachment/generateMethod')(data, app);
  require('./attachment/generatePrototype')(data, app);
  require('./attachment/saveFile')(data, app);

  app.attachment = data;

};
