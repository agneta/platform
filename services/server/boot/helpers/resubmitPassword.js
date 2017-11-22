module.exports = function(app) {
  return function(ctx, user, next) {

    var accessToken = ctx.req.accessToken;

    // Skip password confirmation for short term tokens
    if (accessToken.ttl < 1000) {
      return next();
    }

    var body = ctx.req.body;
    var password = body.password || body.password_old;

    if (!password) {
      return next({
        code: 'CONFIRM_PASS_REQUIRED',
        message: 'Password is required'
      });
    }

    app.models.Account.findById(accessToken.userId)
      .then(function(currentUser) {
        return currentUser.hasPassword(password);
      })
      .then(function(isMatch) {
        if (!isMatch) {
          return next({
            code: 'CONFIRM_PASS_WRONG',
            message: 'Could not confirm your request because you entered a wrong password'
          });
        }
        next();
      })
      .catch(next);
  };
};
