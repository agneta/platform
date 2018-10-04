module.exports = function(app) {
  app.query = {};
  require('./query/list')(app);
};
