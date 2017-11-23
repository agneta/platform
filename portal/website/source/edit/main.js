/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/main.js
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

/*global _e_fieldState:true*/
/*global _e_helpers:true*/
/*global _e_content:true*/
/*global _e_contributor:true*/
/*global _e_history:true*/
/*global _e_main:true*/
/*global _e_media:true*/
/*global _e_search:true*/
/*global _e_source:true*/

/*global _:true*/
/*global Fuse:true*/

(function() {

  var app = angular.module('MainApp');

  app.controller('EditMainCtrl', function($scope, $rootScope, $routeParams, $parse, $ocLazyLoad, $timeout, $mdToast, Account, GIT, $location, $mdDialog, Upload, Portal, MediaOpt, Role_Editor) {

    var fuse;
    var fuseOptions = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'title',
        'path'
      ]
    };

    var itemsLoaded;
    var helpers = {};
    var scopeEdit = $scope;

    $scope.mainForm = {};

    $scope.edit = {};
    $scope.templates = null;
    $scope.pages = null;
    $scope.page = null;

    $scope.edit.lang = agneta.lang;
    $scope.edit.languages = [{
      code: 'en',
      title: 'English'
    },
    {
      code: 'gr',
      title: 'Greek'
    }
    ];

    _t_template('edit/_pages/field-state');
    _t_template('edit/_pages/content');
    _t_template('edit/_pages/media');
    _t_template('edit/_pages/helpers');
    _t_template('edit/_pages/history');
    _t_template('edit/_pages/main');
    _t_template('edit/_pages/search');
    _t_template('edit/_pages/source');
    _t_template('edit/_pages/contributor');

    _e_fieldState($scope, helpers);
    _e_content($scope, helpers);
    _e_media($scope, MediaOpt, $mdDialog, helpers);
    _e_helpers($scope, $mdToast, $timeout, helpers);
    _e_history($scope, helpers);
    _e_main($scope, $rootScope, helpers, $location, $timeout, $mdDialog, scopeEdit, Portal, GIT);
    _e_search($scope, $timeout, fuse, itemsLoaded);
    _e_source($scope, $mdDialog, $timeout);
    _e_contributor($scope, $rootScope, Account, Portal, $timeout, Role_Editor);

    $scope.onKeyPress = function(event) {

      // CTRL + SHIFT + S : Save Changes
      if (event.ctrlKey && event.shiftKey && event.keyCode == 19) {
        $scope.save();
      }
      // CTRL + SHIFT + L : Change Language
      if (event.ctrlKey && event.shiftKey && event.keyCode == 12) {
        var index = _.findIndex($scope.edit.languages, {
          code: $scope.edit.lang
        });
        index++;
        if (index == $scope.edit.languages.length) {
          index = 0;
        }
        var language = $scope.edit.languages[index];
        $scope.edit.lang = language.code;
      }
    };

    $scope.edit.lng = function(data) {
      if (!data) {
        return;
      }
      if (_.isObject(data)) {
        data = data.__value || data;
      }
      var result = data[$scope.edit.lang] || '';

      if (!result.length) {
        result = data[agneta.lang] || '';
      }

      if (!result.length) {
        for (var key in data) {
          result = data[key] || '';
          if (result.length) {
            break;
          }
        }
      }

      return result;
    };

    $scope.toggleView = function(data) {
      data._expanded = !data._expanded;
    };

    $scope.isArray = function(val) {
      return angular.isArray(val);
    };

    $scope.init = function(_Model) {
      helpers.Model = _Model;
      $scope.restart()
        .then(function() {
          if ($routeParams.id) {
            $scope.getPage($routeParams.id);
          }
        });
    };

    $scope.restart = function() {

      return helpers.Model.loadTemplates({

      })
        .$promise
        .then(function(result) {

          itemsLoaded = result.templates;
          $scope.templates = null;

          $timeout(function() {

            $scope.templates = itemsLoaded;
            $scope.template = null;
            $scope.page = null;
            $scope.pages = null;
            fuse = new Fuse(itemsLoaded, fuseOptions);

          }, 10);

        });

    };

    $scope.isInline = function(field) {
      switch (field.type) {
        case 'text-single':
        case 'value':
        case 'select':
          return true;
      }
      return false;
    };

    $scope.getField = function(field, key) {
      return _.find(field.fields, {
        name: key.__key || key
      });
    };

    $scope.selectTemplate = function(template) {

      if (template) {
        $scope.template = template;
      } else {
        template = $scope.template;
      }

      return helpers.Model.loadMany({
        template: template.id
      })
        .$promise
        .then(function(result) {
          $scope.pages = null;
          $timeout(function() {
            itemsLoaded = result.pages;
            $scope.pages = itemsLoaded;
            $scope.templates = null;
            fuse = new Fuse(itemsLoaded, fuseOptions);
          }, 10);
        });

    };

    $scope.$broadcast('code:ready');


  });

})();
