module.exports = function(app) {

  return function(req, res, next) {

    if(req.accessToken){
      next();
      return;
    }

    //--------------------------------------
    // Auto sign-in user with certificate


  };

};
