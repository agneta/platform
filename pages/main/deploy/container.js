var _ = require('lodash');
var path = require('path');
var cleanArray = require('clean-array');
var prettyBytes = require('pretty-bytes');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));

var pkgcloud = require('pkgcloud');
var ProgressBar = require('progress');
var Execp = require('../../core/exec');

module.exports = function(locals) {

    var project = locals.project;

    if (!project.config.storage) {
        throw new Error("Could not find deploy configurations");
    }

    var credentials = project.config.storage.credentials;

    var openstack = pkgcloud.storage.createClient({
        provider: 'openstack',
        userid: credentials.userId,
        username: credentials.username,
        password: credentials.password,
        region: credentials.region,
        domainId: credentials.domainId,
        tenantId: credentials.projectId,
        authUrl: credentials.auth_url,
        version: 'v3',
        keystoneAuthVersion: 'v3'
    });

    var env = {
        OS_USER_ID: credentials.userId,
        OS_PASSWORD: credentials.password,
        OS_PROJECT_ID: credentials.projectId,
        OS_REGION_NAME: credentials.region,
        OS_AUTH_URL: 'https://identity.open.softlayer.com/v3',
        OS_IDENTITY_API_VERSION: 3,
        OS_AUTH_VERSION: 3
    };

    var execp = Execp({
        env: env,
        stdout: process.stdout,
        stderr: process.stderr
    });

    function sync(options) {

        var containerName = options.name;
        var pathSource = options.path;

        var filesSource = [];
        var filesDest;
        var filesDestTmp = {};
        var totalSizeSource = 0;
        var container;

        var filesUploaded = [];
        var filesSkipped = [];
        var filesDeleted = [];

        var swiftCommand = 'python3-swift'

        return new Promise(function(resolve, reject) {

          execp.run(`${swiftCommand} post -r '.r:*' ${containerName}`)
              .then(function() {
                  return execp.run(`${swiftCommand} post -m 'web-index:index.html' ${containerName}`);
              })
              .then(function() {

            openstack.getContainer(containerName, function(err, _container) {

                if (err) {
                    return reject(err);
                }

                container = _container;

                console.log();
                console.log('------------------------------------------');
                console.log('Container:', containerName);
                console.log('Total Files:', container.count);
                console.log('Total Size:', prettyBytes(container.bytes));
                console.log('------------------------------------------');

                openstack.getFiles(container, function(err, _filesDest) {

                    if (err) {
                        return reject(err);
                    }

                    filesDest = _filesDest;

                    Promise.map(filesDest, function(fileDest, index) {

                            filesDestTmp[fileDest.name] = index;
                        })
                        .then(function() {

                            return walkSourceFiles();
                        })
                        .then(resolve)
                        .catch(reject);
                });
            });
            });
        });


        function walkSourceFiles() {
            return new Promise(function(resolve, reject) {

                    fs.walk(pathSource)
                        .on('data', function(item) {

                            if (item.stats.isFile()) {

                                var pathRelative = path.relative(pathSource, item.path);

                                filesSource.push({
                                    path: pathRelative,
                                    pathAbs: item.path,
                                    stats: item.stats
                                });

                                totalSizeSource += item.stats.size;
                            }

                        })
                        .on('end', function() {

                            console.log();
                            console.log('------------------------------------------');
                            console.log('Source:', pathSource);
                            console.log('Total Files:', filesSource.length);
                            console.log('Total Size:', prettyBytes(totalSizeSource));
                            console.log('------------------------------------------');
                            console.log();

                            resolve();
                        });
                })
                .then(function() {

                    var bar = new ProgressBar(':percent :path', {
                        total: filesSource.length
                    });

                    return Promise.map(filesSource, function(fileSource) {

                        var fileDest = filesDestTmp[fileSource.path];
                        delete filesDestTmp[fileSource.path];

                        if (fileDest) {

                            fileDest = filesDest[fileDest];


                            if (fileDest.size == fileSource.stats.size) {
                                filesSkipped.push(fileDest);
                                bar.tick({
                                    path: ('SKIPPED: ' + fileSource.path)
                                });
                                return;
                            }

                        }

                        return new Promise(function(resolve, reject) {

                            var readStream = fs.createReadStream(fileSource.pathAbs);
                            var writeStream = openstack.upload({
                                container: container,
                                remote: fileSource.path
                            });

                            writeStream.on('error', function(err) {
                                reject(err);
                            });

                            writeStream.on('success', function(file) {
                                bar.tick({
                                    path: fileSource.path
                                });
                                filesUploaded.push(file);
                                resolve();
                            });

                            readStream.pipe(writeStream);

                        });

                    }, {
                        concurrency: 20
                    });

                })
                .then(function() {

                    var filesDelete = _.values(filesDestTmp);

                    return Promise.map(filesDelete, function(index) {

                        var fileDelete = filesDest[index];

                        return new Promise(function(resolve, reject) {
                            openstack.removeFile(container, fileDelete, function(err, result) {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                filesDeleted.push(fileDelete);
                                console.log('Deleted:', fileDelete.name);
                                resolve();
                            });
                        });
                    });

                })
                .then(function() {

                    console.log();
                    console.log('------------------------------------------');
                    console.log('Uploaded:', filesUploaded.length);
                    console.log('Skipped:', filesSkipped.length);
                    console.log('Deleted:', filesDeleted.length);
                    console.log('------------------------------------------');
                    console.log();

                })
                .catch(function(err) {
                    console.error(err);
                });
        }

    }

    return {
        sync: sync
    };
};
