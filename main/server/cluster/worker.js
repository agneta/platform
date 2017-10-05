/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/cluster/worker.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
const cluster = require('cluster');
const express = require('express');
const loopback = require('loopback');
const chalk = require('chalk');
const Promise = require('bluebird');
var _ = require('lodash');

_.mixin(require('lodash-deep'));

Promise.config({
  // Enables all warnings except forgotten return statements.
  warnings: {
    wForgottenReturn: false
  }
});

module.exports.run = function(worker) {

  var app;
  var server;

  switch (process.env.MODE) {
    case 'services':
      app = loopback();
      server = require('../services');
      break;
    case 'portal':
      app = express();
      server = require('../portal');
      break;
    default:
      throw new Error('Unrecognized process mode:',process.env.MODE);
  }

  //--------------------------------

  var log = console.log;

  console.log = function() {
    var args = Array.prototype.slice.call(arguments);
    log.apply(console, [chalk.cyan(`[worker:${cluster.worker.id}]`)].concat(args));
  };

  var httpServer = worker.httpServer;
  var starting = true;
  httpServer.on('request', app);

  app.use(function(req, res, next) {
    if (starting) {
      return res.send('Starting the Application. Try refreshing again in a couple of seconds.');
    }
    next();
  });

  server({
    worker: worker,
    server: httpServer,
    app: app
  })
    .then(function(result) {
      starting = false;
      console.log(chalk.bold.green('Application is available'));
      worker.sendToMaster({
        started: true,
        result: result
      });

    });

};
