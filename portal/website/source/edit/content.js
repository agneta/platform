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

/*global _:true*/
/*global Fuse:true*/

require('edit/content/field-menu.module');

agneta.directive('AgEditMainCtrl', function($rootScope, $routeParams, $parse, $ocLazyLoad, $timeout, $mdToast, Account, GIT, $location, $mdDialog, Upload, Portal, AgMedia, Role_Editor) {
  var vm = this;
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

  var helpers = {};
  var scopeEdit = vm;

  vm.mainForm = {};

  vm.edit = {};
  vm.templates = null;
  vm.pages = null;
  vm.page = null;

  vm.edit.lang = agneta.lang;
  vm.edit.languages = [{
    code: 'en',
    title: 'English'
  },
  {
    code: 'gr',
    title: 'Greek'
  }
  ];

  require('edit/content/field-state.module')(vm, helpers);
  require('edit/content/content.module')(vm, helpers);
  require('edit/content/media.module')(vm, AgMedia, $mdDialog, helpers);
  require('edit/content/helpers.module')(vm, $mdToast, $timeout, helpers);
  require('edit/content/history.module')(vm, helpers);
  require('edit/content/main.module')(vm, $rootScope, helpers, $location, $timeout, $mdDialog, scopeEdit, Portal);
  require('edit/content/search.module')(vm, $timeout);
  require('edit/content/source.module')(vm, $mdDialog, $timeout);
  require('edit/content/contributor.module')(vm, $rootScope, Account, Portal, $timeout, Role_Editor);

  vm.onKeyPress = function(event) {

    // CTRL + SHIFT + S : Save Changes
    if (event.ctrlKey && event.shiftKey && event.keyCode == 19) {
      vm.save();
    }
    // CTRL + SHIFT + L : Change Language
    if (event.ctrlKey && event.shiftKey && event.keyCode == 12) {
      var index = _.findIndex(vm.edit.languages, {
        code: vm.edit.lang
      });
      index++;
      if (index == vm.edit.languages.length) {
        index = 0;
      }
      var language = vm.edit.languages[index];
      vm.edit.lang = language.code;
    }
  };

  vm.edit.lng = function(data) {
    if (!data) {
      return;
    }
    if (_.isObject(data)) {
      data = data.__value || data;
    }
    var result = data[vm.edit.lang] || '';

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

  vm.toggleView = function(data) {
    data._expanded = !data._expanded;
  };

  vm.isArray = function(val) {
    return angular.isArray(val);
  };

  vm.init = function(options) {
    helpers.Model = options.model;
    helpers.mediaRoot = options.mediaRoot;
    vm.restart()
      .then(function() {
        if ($routeParams.id) {
          vm.getPage($routeParams.id);
        }
      });
  };

  vm.restart = function() {

    return helpers.Model.loadTemplates({

    })
      .$promise
      .then(function(result) {

        vm.itemsLoaded = result.templates;
        vm.templates = null;

        $timeout(function() {

          vm.templates = vm.itemsLoaded;
          vm.template = null;
          vm.page = null;
          vm.pages = null;
          vm.fuse = new Fuse(vm.itemsLoaded, fuseOptions);

        }, 10);

      });

  };

  vm.isInline = function(field) {
    switch (field.type) {
      case 'text-single':
      case 'value':
      case 'select':
        return true;
    }
    return false;
  };

  vm.getField = function(field, key) {
    return _.find(field.fields, {
      name: key.__key || key
    });
  };

  vm.selectTemplate = function(template) {

    if (template) {
      vm.template = template;
    } else {
      template = vm.template;
    }

    return helpers.Model.loadMany({
      template: template.id
    })
      .$promise
      .then(function(result) {
        vm.pages = null;
        $timeout(function() {
          vm.itemsLoaded = result.pages;
          vm.pages = vm.itemsLoaded;
          vm.templates = null;
          vm.fuse = new Fuse(vm.itemsLoaded, fuseOptions);
        }, 10);
      });

  };

  vm.$broadcast('code:ready');


});
