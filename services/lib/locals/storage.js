const _ = require('lodash');

module.exports = function(data) {
  var app = data.app;
  var options = data.options;
  var env = app.web.services.get('env');

  var configName = 'storage';
  var storageConfig = app.web.services.get(configName);

  if (!storageConfig) {
    app.web.services.set(configName, {});
    storageConfig = app.web.services.get(configName);
  }
  storageConfig.provider = storageConfig.provider || 'local';
  storageConfig.port = _.get(options, 'storage.port');

  var domain =
    _.get(options.web || options.client, 'project.config.domain.production') ||
    'example.com';

  var buckets = {
    media: {
      staging: 'media-staging',
      private: 'media-private',
      production: 'media'
    },
    pages: {
      staging: 'staging-private',
      production: 'private'
    },
    assets: {
      staging: 'assets-staging',
      production: 'assets'
    }
  };

  if (storageConfig.provider !== 'local') {
    _.deepMapValues(buckets, function(value, path) {
      value += `.${domain}`;
      _.set(buckets, path, value);
    });
  }

  switch (env) {
    case 'production':
      buckets.media.host = buckets.media.production;
      buckets.pages.host = buckets.pages.production;
      buckets.assets.host = buckets.assets.production;
      break;
    default:
      buckets.media.host = buckets.media.staging;
      buckets.pages.host = buckets.pages.staging;
      buckets.assets.host = buckets.assets.staging;
      break;
  }

  buckets.email = `email.${domain}`;
  storageConfig.buckets = buckets;
};
