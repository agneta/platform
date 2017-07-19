/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/exec.js
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
const childProcess = require('child_process');

/**
 * Promisified child_process.exec
 *
 * @param cmd
 * @param opts See child_process.exec node docs
 * @param {stream.Writable} opts.stdout If defined, child process stdout will be piped to it.
 * @param {stream.Writable} opts.stderr If defined, child process stderr will be piped to it.
 * @param {bool} opts.killOnExit Kill the child process when the parent process exits
 *
 * @returns {Promise<{ stdout: string, stderr: stderr }>}
 */

function Main(opts){
    this.opts = opts;
}

Main.prototype.run = function(cmd, std) {

    var opts = this.opts || (this.opts = {});

    return new Promise(function(resolve, reject) {

        //console.log(cmd);

        var child = childProcess.exec(cmd, opts, function(err, stdout, stderr) {

            if (err) {
                reject(err);
                return;
            }

            if (std) {
                std({
                    stdout: stdout,
                    stderr: stderr
                });
            }
        });

        if (opts.stdout) {
            child.stdout.pipe(opts.stdout);
        }

        if (opts.stderr) {
            child.stderr.pipe(opts.stderr);
        }

        var killChild = function() {
            console.warn(`Killing child process ${child.pid}`);
            child.kill();
        };

        var result = '';

        child.stdout.on('data', function(data) {
            result += data.toString();
        });

        process.on('exit', killChild);

        child.on('exit', function() {

            resolve(result);

            process.removeListener('exit', killChild);
        });
    });
}

module.exports = function(opts) {
    return new Main(opts);
};
