module.exports = function() {

  return Promise.resolve()
    .then(function() {
      return global.requireMain('server/terminal')();
    })
    .then(function(servers) {
      return require('./dependencies')(servers);
    });

};
