module.exports = function(app) {

  return function(req,res,next) {

    app.frameguard({
      req: req,
      res: res
    });

    next();
  };
};
