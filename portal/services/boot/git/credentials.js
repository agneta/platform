var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');

module.exports = function(app) {

    var webPrj = app.get('options').web.project;

    var sshDir = path.join(webPrj.paths.project, 'ssh');
    var sshPublicKey = path.join(sshDir, "id_rsa.pub");
    var sshPrivateKey = path.join(sshDir, "id_rsa");

    app.git.credentials = function(url,username) {
        return nodegit.Cred.sshKeyNew(username, sshPublicKey, sshPrivateKey, '');
    };

};
