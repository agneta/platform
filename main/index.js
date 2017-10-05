const pm2 = require('pm2');
const path = require('path');


pm2.connect(function(err) {

  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start({
    name: 'agneta',
    script: path.join(__dirname, 'server', 'index.js'),
    exec_mode: 'cluster',
    max_memory_restart: '400M'
  }, function(err, apps) {

    console.log(apps);
    pm2.disconnect();
    if (err) throw err;

  });
});
