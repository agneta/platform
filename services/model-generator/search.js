/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/model-generator/search.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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
