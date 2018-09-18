require('source-map-support').install();

import { Request, Response } from 'request';
import { NextFunction } from 'express';

/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/cluster/worker.js
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
const express = require('express');
const loopback = require('loopback');
const chalk = require('chalk');
const path = require('path');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;
var SCWorker = require('socketcluster/scworker');

Promise.config({
  // Enables all warnings except forgotten return statements.
  warnings: {
    wForgottenReturn: false
  }
});

const dirAbsolute = path.join(process.env.HOME, '.agneta');
process.env.XDG_CONFIG_HOME = dirAbsolute;

class Worker extends SCWorker {
  run() {
    var worker = this;
    var app: any;
    var server: any;
    var emitter = new EventEmitter();

    switch (process.env.MODE) {
      case 'pages':
        app = express();
        server = require('../pages');
        break;
      case 'services':
        app = loopback();
        server = require('../services');
        break;
      case 'live':
        app = loopback();
        server = require('../live');
        break;
      case 'portal':
        app = express();
        server = require('../portal');
        break;
      default:
        throw new Error(`Unrecognized process mode: ${process.env.MODE}`);
    }

    //--------------------------------

    var httpServer = worker.httpServer;
    var starting = true;
    httpServer.on('request', app);

    app.set('trust proxy', 1);

    app.use(function(req: Request, res: Response, next: NextFunction) {
      if (starting) {
        emitter.on('available', next);
        return;
      }
      next();
    });

    Promise.resolve()
      .then(function() {
        return server({
          worker: worker,
          server: httpServer,
          app: app
        });
      })
      .then(function(result: any) {
        starting = false;
        console.log(chalk.bold.green('Application is available'));
        emitter.emit('available');
        worker.sendToMaster({
          started: true,
          result: result
        });
      });
  }
}

new Worker();
