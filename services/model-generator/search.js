const _ = require('lodash');

module.exports = function(app, config) {

  var configSearch = app.get('search');
  var searchModels = [];

  for (let name in configSearch) {
    let options = configSearch[name];

    //-----------------------------------------------------------

    _.defaults(options,{
      models:{}
    });

    let source = options.model || options.models.source;

    if(!source){
      throw new Error(`Source is missing from search config with name: ${name}`);
    }

    _.defaults(options.models,{
      position: `${source}_Search_Position`,
      field: `${source}_Search_Field`,
      keyword: `${source}_Search_Keyword`
    });

    options.models.source = source;

    //-----------------------------------------------------------

    searchModels.push({
      model: require('./search-field')(options),
      config: {
        dataSource: 'db',
        public: false
      }
    });

    searchModels.push({
      model: require('./search-keyword')(options),
      config: {
        dataSource: 'db',
        public: false
      }
    });

    searchModels.push({
      model: require('./search-position')(options),
      config: {
        dataSource: 'db',
        public: false
      }
    });

  }

  //-----------------------------------------------------------

  for (var item of searchModels) {

    let name = item.model.name;
    let fileName = name.toLowerCase() + '.json';

    config._definitions[fileName] = {
      definition: item.model
    };

    config.models[name] = item.config;

  }

};
