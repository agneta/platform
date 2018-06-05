
module.exports = function(app) {

  require('./models/production')(app);
  require('./models/project')(app);

};
