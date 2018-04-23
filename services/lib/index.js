module.exports = function(app,options){
  require('./secrets')(app, options);
  require('./moment')();
  require('./log')(app);
  require('./gis')(app);
  require('./require')(app);
  require('./locals')(app, options);
  require('./language')(app);
  require('./socket')(app,options);
};
