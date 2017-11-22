const path = require('path');

module.exports = function(mediaPath) {
  mediaPath = path.normalize(mediaPath);

  if (mediaPath[0] == '/') {
    mediaPath = mediaPath.substring(1);
  }

  if (mediaPath.substr(-1) === '/') {
    mediaPath = mediaPath.substr(0, mediaPath.length - 1);
  }

  return mediaPath;
};
