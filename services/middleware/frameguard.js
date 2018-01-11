module.exports = function(app) {

  return function(req,res,next) {

    res.setHeader('X-Frame-Options', app.frameguard(req));

    next();
  };
};
