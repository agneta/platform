/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/helpers/limitCollection.js
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
module.exports = function(){

  return function(options) {

    var where = options.where;
    var prop = options.prop;
    var model = options.model;
    var limit = options.limit || 40;

    return Promise.resolve()
      .then(function() {
        return model.find({
          skip: limit-1,
          limit: 1,
          order: `${prop} DESC`,
          where:where
        });
      })
      .then(function(result){

        //console.log('result',result);
        result = result[0];

        if(!result){
          return;
        }

        var deleteWhere = _.extend({},where);
        var value = result[prop];

        if(!value){
          throw new Error(`Cannot find value with prop: ${prop}`);
        }

        if(options.isDate){
          value = new Date(value);
        }

        deleteWhere[prop] = {
          lt: value
        };

        return model.deleteAll(deleteWhere);
      });

  };
};
