module.exports = function(mimeType) {

  if (!mimeType) {
    return;
  }

  var typeParsed = mimeType.split('/');
  var mimetype = typeParsed[0];
  var mediatype = typeParsed[1];

  var type = mimetype;

  switch (mimetype) {
    case 'image':
      switch (mediatype) {
        case 'jpeg':
        case 'png':
          type = 'image';
          break;
        case 'svg+xml':
          type = 'icon';
          break;
        default:

      }
      break;
    case 'application':
      switch (mediatype) {
        case 'pdf':
          type = 'pdf';
          break;
      }
      break;
    default:

  }

  return type;
};
