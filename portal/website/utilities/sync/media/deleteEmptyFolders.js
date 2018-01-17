const Promise = require('bluebird');

module.exports = function(options){

  var Media = options.Media;
  var util = options.util;
  var barDeleteFolders;

  return Media.count({
    type: 'folder'
  }).then(function(totalFolders) {
    barDeleteFolders = util.progress(totalFolders, {
      title: 'Delete empty folders'
    });
    return deleteEmptyFolders();
  });

  function deleteEmptyFolders(skip) {

    skip = skip || 0;
    var length;

    return Media.find({
      where: {
        type: 'folder'
      },
      fields: {
        id: true,
        location: true
      },
      limit: 30,
      skip: skip
    }).then(function(result) {

      length = result.length;
      barDeleteFolders.addLength(length);

      return Promise.map(result, function(obj) {

        return Promise.resolve()
          .delay(40)
          .then(function() {

            return Media._list(obj.location, 1);

          })
          .then(function(result) {
            if (!result.count) {
              return obj.destroy()
                .then(function() {
                  util.log('Deleted Empty Folder: ' + obj.location);
                });
            }
          })
          .then(function() {
            barDeleteFolders.tick({
              title: obj.location
            });
          });
      }, {
        concurrency: 5
      });

    })
      .then(function() {
        if (length) {
          skip += length;
          return deleteEmptyFolders(skip);
        }

      });

  }

};
