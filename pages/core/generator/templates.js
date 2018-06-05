module.exports = function(locals) {

  var project = locals.project;
  var templates = project.site.templates = {};
  return function(page){
    var template = templates[page.template] || {
      pages: []
    };
    template.pages.push(page);

    templates[page.template] = template;
  };
};
