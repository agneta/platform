const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(options) {

  let foundFolders = options.foundFolders;
  let util = options.util;
  let Media = options.Media;

  var foundFoldersArr = _.keys(foundFolders);

  var bar = util.progress(foundFoldersArr.length, {
    title: 'Create missing folders'
  });

  return Promise.map(foundFoldersArr, function(folderLocation) {

    return Media.findOrCreate({
      where: {
        location: folderLocation
      }
    }, {
      name: path.parse(folderLocation).name,
      location: folderLocation,
      type: 'folder'
    })
      .then(function(res) {

        bar.tick({
          title: folderLocation
        });

        if (res[1]) {
          util.log('Created Missing Folder: ' + folderLocation);
        }
      });

  }, {
    concurrency: 5
  });
};
