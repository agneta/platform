/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/history.js
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
const Promise = require('bluebird');

module.exports = function(Model,app) {

  Model.add = function(options){

    return Model.create({
      refId: options.id,
      collection: options.model.modelName,
      timestamp: new Date(),
      message: options.message,
      diff: options.diff,
      accountId: options.req.accessToken.userId,
      data: options.data
    })
      .then(function(){

        return app.helpers.limitCollection({
          where:{
            collection: options.model.modelName,
            refId: options.id
          },
          prop: 'timestamp',
          isDate: true,
          model: Model,
          limit: 40
        });

      });

  };

  Model.load = function(options){

    return Model.find({
      where:{
        refId: options.id,
        collection: options.model.modelName,
      },
      fields:{
        id: true,
        accountId: true,
        timestamp: true,
        message: true,
        diff: true
      },
      order: 'timestamp DESC'
    })
      .then(function(items) {
        return Promise.map(items,function(item){

          item.diff = item.diff || [];

          if(!item.message){
            var lines  = ['Changes:'];
            for(var change of item.diff){
              if(lines.length>4){
                lines.push('...');
              }
              lines.push(`${change.path.join('.')}: ${change.lhs}`);
            }
            item.message = lines.join('\n');
          }

          return item;
        });
      });

  };
};
