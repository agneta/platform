const Promise = require('bluebird');

module.exports = function(options){

  var foundObjects = options.foundObjects;
  var Media = options.Media;
  var util = options.util;
  var barDeleteUnused;

  return Media.count({
    type: {
      neq: 'folder'
    }
  }).then(function(totalFiles) {

    barDeleteUnused = util.progress(totalFiles, {
      title: 'Delete unused locations'
    });

    return deleteUnused();

  });

  function deleteUnused(skip) {

    skip = skip || 0;
    var length;

    return Media.find({
      where: {
        type: {
          neq: 'folder'
        }
      },
      fields: {
        id: true,
        location: true
      },
      limit: 200,
      skip: skip
    }).then(function(result) {

      length = result.length;
      barDeleteUnused.addLength(length);

      return Promise.map(result, function(obj) {

        var exists = foundObjects[obj.location];

        return Promise.resolve()
          .delay(20)
          .then(function() {

            if (exists) {
              return;
            }

            return obj.destroy()
              .then(function() {
                util.log('Deleted Missing Folder: ' + obj.location);
              });

          })
          .then(function() {
            barDeleteUnused.tick({
              title: obj.location
            });
          });
      }, {
        concurrency: 20
      });

    })
      .then(function() {
        if (length) {
          skip += length;
          return deleteUnused(skip);
        }

      });
  }
};
