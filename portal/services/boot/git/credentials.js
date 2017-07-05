const nodegit = require('nodegit');
const path = require('path');

module.exports = function(app) {

    var base_dir = process.cwd();

    var sshDir = path.join(base_dir, 'ssh');
    var sshPublicKey = path.join(sshDir, "id_rsa.pub");
    var sshPrivateKey = path.join(sshDir, "id_rsa");

    app.git.credentials = function(url, username) {
        return nodegit.Cred.sshKeyNew(username, sshPublicKey, sshPrivateKey, '');
    };

};
