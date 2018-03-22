module.exports = function(app) {
  return function(options) {

    var model = options.model || {};
    var name = options.name;

    if (options.isProduction||model.__isProduction) {
      return app.models['Production_' + name];
    }

    return app.models[name];
  };
};
