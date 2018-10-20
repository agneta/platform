module.exports = function(locals) {
  var page = (locals.page = {});

  page.type = require('./types');
  require('./commonData')(locals);
  require('./renderData')(locals);
  require('./parseFileName')(locals);
  require('./generate')(locals);
  require('./read')(locals);

  return {
    load: function() {
      return page
        .generate()
        .then(function() {
          console.log('generated!');
          return page.read();
        })
        .then(function() {
          console.log('read!');
        })
        .catch(function(err) {
          console.log('Generator Error (check logs): ', err.message);
          console.error();
          return Promise.reject(err);
        });
    },
    start: function() {
      require('./process')(locals);
    }
  };
};
