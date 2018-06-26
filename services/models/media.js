module.exports = function(Model, app) {
  var config = app.web.services.get('storage');
  var prjHelpers = app.client.app.locals;

  Model._url = prjHelpers.get_media;

  require('./media/main')(Model, app, {
    name: 'public',
    bucket: config.buckets.media.staging
  });
};
