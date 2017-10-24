module.exports = function(app) {

  var pages = app.get('options').web;

  return function(req, res, next) {

    app.auth.middleware({
      req: req,
      res: res,
      next: next,
      allow: ['administrator', 'editor'],
      route: pages.app
    });

  };

};
