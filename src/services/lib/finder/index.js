module.exports = function(app) {

  app.finder = {};

  require('./paginate')(app);

};
