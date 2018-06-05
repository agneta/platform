/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/list.js
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
module.exports = function(Model) {

  Model._list = function(dir, limit, marker) {

    var objects = [];
    var whereFilter = [];

    return Promise.resolve()
      .then(function() {
        marker = marker || 0;
        dir = dir || '';

        //---------------------------------------------------

        dir = dir.split('/').join('\\/');
        if (dir && dir.length) {
          dir += '\\/';
        }

        var regexp = '/^' + dir + '[^\\/]+$/';

        whereFilter = {
          location: {
            regexp: regexp
          }
        };

        return Model.find({
          where: whereFilter,
          limit: limit,
          skip: marker,
          order: ['type ASC', 'name ASC']
        });
      })
      .then(function(_objects) {

        for (var object of _objects) {
          Model.__prepareObject(object);
        }

        objects = _objects;

        return Model.count(
          whereFilter
        );
      })
      .then(function(count) {

        var truncated = (count - marker) > limit;
        var nextMarker;
        var nextLimit;

        if (truncated) {
          nextMarker = marker + limit;
          nextLimit = Math.min(count - nextMarker, limit);
        }

        return {
          objects: objects,
          nextMarker: nextMarker,
          nextLimit: nextLimit,
          truncated: truncated,
          count: count
        };
      });

  };

  Model.list = function(dir, marker) {

    return Model._list(dir, 20, marker);
  };

  Model.remoteMethod(
    'list', {
      description: 'List the files',
      accepts: [{
        arg: 'dir',
        type: 'string',
        required: false
      }, {
        arg: 'marker',
        type: 'number',
        required: false
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/list'
      }
    }
  );

};
