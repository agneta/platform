const path = require('path');

module.exports = function(locals) {

  var project = locals.project;

  project.extend.helper.register('uiTabs', function() {

    var self = this;
    var _locals = self.locals;

    var templates = _locals.list.map(function(section){
      var templatePath = section.template;
      if(_locals.location && section.name){
        templatePath = path.join(_locals.location,section.name);
      }
      if(!templatePath){
        throw new Error(`Cannot get template path from tab item: ${self.lng(section.title)}`);
      }
      section.path = templatePath;
      section.name = section.name || path.parse(templatePath).name;

      return section;
    });
    var attrId;
    if(_locals.id){
      attrId = `id="${_locals.id}"`;
    }

    return {
      templates: templates,
      align: _locals.align || 'start',
      attrId: attrId,
      name: _locals.name || 'tab'
    };
  });

};
