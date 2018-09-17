module.exports = function(app, options) {
  require('./configstore')(app);
  require('./secrets')(app, options);
  require('./providers')(app, options);
  require('./moment')();
  require('./log')(app);
  require('./require')(app);
  require('./locals')(app, options);
  require('./language')(app);
  require('./socket')(app, options);
  require('./media')(app, options);
};
