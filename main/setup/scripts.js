const Promise = require('bluebird');

module.exports = function(servers) {

  const log = global.requireMain('log');
  const projectPaths = global.requireMain('paths');

  return Promise.resolve()
    .then(function() {

      return Promise.map([{
        server: servers.servicesPortal,
        dir: projectPaths.appPortal.generated
      },
      {
        server: servers.servicesWebsite,
        dir: projectPaths.app.generated
      },
      ], function(service) {
        return service.server.locals.app.generate.scripts({
          outputDir: service.dir
        });
      });

    })
    .then(function() {
      log.success('Exported Scripts');
    });
};
