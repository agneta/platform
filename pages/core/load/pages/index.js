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
      return page.read().catch(function(err) {
        console.log('Generator Error (check logs): ', err.message);
        console.error(err);
        return Promise.reject(err);
      });
    },
    start: function() {
      require('./process')(locals);

      return page.generate();
    }
  };
};
