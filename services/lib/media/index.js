module.exports = function(app) {
  app.media = {};
  require('./album')(app);
};
