var tmp = require('tmp');
tmp.setGracefulCleanup();

function ContextWrapper(ctx1, server) {
  this.ctx = ctx1;
  this.server = server;
  this.method = this.ctx.method;
  this.username = this.ctx.username;
  this.password = this.ctx.password;
}

ContextWrapper.prototype.reject = function(methodsLeft, isPartial) {
  return this.ctx.reject(methodsLeft, isPartial);
};

ContextWrapper.prototype.accept = function(callback) {
  if (callback == null) {
    callback = function() {};
  }
  this.ctx.accept();
  return this.server._session_start_callback = callback;
};

module.exports = ContextWrapper;
