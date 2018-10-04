module.exports = function(app) {
  app.explorer = {};

  require('./explorer/directory')(app);
  require('./explorer/list')(app);
};
