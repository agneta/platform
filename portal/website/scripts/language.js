module.exports = function(locals) {

  var project = locals.project;
  var webPrj = locals.web.project;

  project.on('initiated', function() {
    project.config.language = webPrj.config.language;
    project.config.languages = webPrj.config.languages;
  });

};
