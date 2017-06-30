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
