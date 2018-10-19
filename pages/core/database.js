module.exports = function(locals) {
  var project = locals.project;
  project.site.pages = locals.services.models.Page;
};
