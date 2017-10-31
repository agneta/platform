const pm2 = require('pm2');
const path = require('path');

pm2.connect(function(err) {

  var name = 'agneta';
  var base = path.join(process.cwd(),'.pm2/logs');
  var outputPath = path.join(base,'output.log');
  var errorPath = path.join(base,'error.log');

  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start({
    name: name,
    script: path.join(__dirname, 'server', 'index.js'),
    exec_mode: 'fork',
    logDateFormat: 'YYYY-MM-DD HH:mm Z',
    max_memory_restart: '400M',
    output: outputPath,
    error: errorPath
  }, function(err) {
    console.log('pm2',arguments);
    if (err) throw err;

  });
});
