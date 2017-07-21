const path = require('path');
module.exports = function(locals) {

  var project = locals.project;
  var helpers = locals.app.locals;

  return {
    run: function(page) {

      if (page.parent) {
        var parent = project.site.pages.findOne({
          parentName: page.parent
        });
        if (parent) {
          page.parentPath = parent.path;
        }
      }

      //-----------------------------------------

      var basePage = path.parse(page.pathSource || page.path)
        .dir;

      if (basePage) {
        basePage = helpers.get_page(basePage);
        if (basePage) {
          page.parentPath = basePage.path;
        }
      }

      //-----------------------------------------

      if (!page.parentPath) {
        page.parentPath = '/';
      }

      if (page.templateSource == 'home') {
        page.parentPath = null;
      }

    }
  };


};
