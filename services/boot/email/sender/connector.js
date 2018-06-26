const _ = require('lodash');
const Promise = require('bluebird');

function MailConnector(options) {
  var app = options.app;
  var self = this;

  self.config = app.web.services.get('email');
  self.secrets = app.web.services.secrets.get('email');

  if (!self.config) {
    throw new Error('No Email config is present');
  }

  //--------------------------------------------------------------

  self.subjectPrefix = _.get(self.config, 'subject.prefix');
  //--------------------------------------------------------------

  var provider;

  switch (self.config.provider) {
    case 'aws':
      provider = require('./provider/aws');
      break;
    case 'sendgrid':
      provider = require('./provider/sendgrid');
      break;
    case 'nodemailer':
      provider = require('./provider/nodemailer');
      break;
    default:
      throw new Error(`Uknown email provider: ${self.secrets.provider}`);
  }

  self.provider = provider({
    secrets: self.secrets
  });
}

MailConnector.name = 'email';

MailConnector.prototype.DataAccessObject = require('./mailer');

MailConnector.initialize = function(dataSource, cb) {
  dataSource.connector = new MailConnector(dataSource.settings);

  return Promise.resolve()
    .then(function() {
      return dataSource.connector.provider.init(dataSource.settings.app);
    })
    .asCallback(cb);
};

module.exports = MailConnector;
