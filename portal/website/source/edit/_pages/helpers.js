/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/_pages/helpers.js
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

/*global _:true*/

function _e_helpers($scope, $mdToast, $timeout, helpers) {

  //---------------------------------------
  helpers.setFilePath = function(file, location) {
    file.location = helpers.fixPath(location);
  };
  //---------------------------------------
  helpers.toast = function(message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom right')
        .hideDelay(3000)
    );
  };
  //------------------------------------------
  helpers.fixPath = function(path) {
    path = agneta.urljoin(path, '/');
    if (path[0] == '/') {
      return path.substring(1);
    }
    return path;
  };
  //------------------------------------------
  helpers.getBasePath = function() {
    var base = agneta.urljoin('_t_configPrj("media.storageRoot");',$scope.page.path);
    return helpers.fixPath(base);
  };
  //------------------------------------------
  helpers.dataValue = function(obj) {
    if (!obj) {
      return obj;
    }

    if (_.isObject(obj)) {
      var val = obj.__value;
      if (!_.isNull(val) && !_.isUndefined(val)) {
        return val;
      }
    }

    return obj;
  };
  //------------------------------------------
  helpers.fieldValue = function(field) {

    switch (field.valueType || field.type) {
      case 'value':
        return '';
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
      case 'text':
        return {};
    }

    console.error('unrecognised type: ', field.type || field);
  };
  //------------------------------------------
  helpers.fixValue = function(parent, key, childField) {

    var parentValue = helpers.dataValue(parent);
    var child = parentValue[key];

    if (_.isNull(child) || _.isUndefined(child)) {
      return;
    }

    var id = parent.__id || '';

    if (parent.__id) {
      id += '.' + key;
    } else {
      id += key;
    }

    var childValue = angular.copy(helpers.dataValue(child));

    child = {
      __id: id
    };

    if (_.isArray(parentValue)) {
      if (childValue.key && childValue.value) {
        child.__key = childValue.key;
        childValue = childValue.value;
      } else {
        child.__key = childField.name;
      }
    }

    child.__value = childValue;

    if (parent.__value) {
      parent.__value[key] = child;
    } else {
      parent[key] = child;
    }

    return child;
  };
  //------------------------------------------
  helpers.getDataPath = function(source) {
    var result = '';
    var parseId = source.split('.');

    for (var index in parseId) {
      var prop = parseId[index];
      if (isFinite(parseInt(prop))) {
        result += '.__value';
        result += '[' + prop + ']';
      } else {
        if (result.length) {
          result += '.';
        }
        result += prop;
      }
    }

    result = 'page.data.' + result + '.__value';
    return result;
  };
  //------------------------------------------
  helpers.structureData = function(field, data) {

    var iteratee = helpers.dataValue(data);

    if (!_.isArray(iteratee) && !_.isObject(iteratee)) {
      return;
    }

    for (var key in iteratee) {

      if (!field.fields) {
        continue;
      }

      if (!_.isArray(field.fields)) {
        console.error('Fields must be an array', field.fields);
      }

      var childData = iteratee[key];
      var fieldKey = childData.__key || childData.key || key;

      var childField = _.find(field.fields, {
        name: fieldKey
      });

      if (!childField) {

        if (field.type == 'array' && field.fields.length == 1) {
          childField = field.fields[0];
        }

      }

      if (childField) {
        var result = helpers.fixValue(data, key, childField);
        if (result) {
          helpers.structureData(childField, result);
        }
      }
    }

  };
  //------------------------------------------
  helpers.setData = function(data) {
    $scope.page.data = null;
    $timeout(function() {
      $scope.page.data = data;
    }, 100);
  };

}
