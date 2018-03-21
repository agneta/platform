const path = require('path');
const presetBase = 'form/presets';
const _ = require('lodash');
module.exports = function(app, clientHelpers) {

  app.form.load = function(options){

    var form = options.form;
    var formName;

    if (_.isString(form)) {
      formName = form;
      let dataPath = formName;
      if(dataPath.indexOf(presetBase)!=0){
        dataPath = path.join(presetBase,dataPath);
      }
      form = clientHelpers.get_data(dataPath);

      if(!form){
        throw new Error(`Could not find form with name: ${formName}`);
      }

    }

    if(!form.name){
      form.name = options.name || formName;
    }

    return form;
  };
};
