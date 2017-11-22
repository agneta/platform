const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(app) {

  return function(names) {

    names = _.isArray(names) ? names : [names];

    var db = app.dataSources.db.connector.db;

    return Promise.resolve()
      .then(function() {
        return db.listCollections()
          .toArray();
      })
      .then(function(list) {
        return Promise.map(names, function(name) {

          if (_.find(list, {
            name: name
          })) {
            return db.collection(name).drop();
          }

        });
      })
      .then(function() {
        return app.indexes.autoupdate(names);
      });

  };
};
