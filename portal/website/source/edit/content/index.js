/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/content.js
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

require('edit/content/field-menu.module');
agneta.directive('AgEditMainCtrl', function($rootScope, $injector, $routeParams, $parse, $ocLazyLoad, $timeout, $mdToast, Account, GIT, $location, $mdDialog, Upload, Portal, AgMedia, Role_Editor) {

  var vm = this;
  var helpers = {};
  var scopeEdit = vm;

  vm.mainForm = {};

  vm.edit = {};
  vm.sidebar = {};
  vm.templates = null;
  vm.pages = null;
  vm.page = null;

  vm.edit.lang = agneta.lang;


  var shared = {
    vm: vm,
    $rootScope: $rootScope,
    helpers: helpers,
    $location: $location,
    $mdToast: $mdToast,
    $routeParams: $routeParams,
    $timeout: $timeout,
    $injector: $injector,
    $mdDialog: $mdDialog,
    scopeEdit: scopeEdit,
    Portal: Portal
  };

  require('edit/content/field-state.module')(vm, helpers);
  require('edit/content/templates.module')(shared);
  require('edit/content/content.module')(vm, helpers);
  require('edit/content/route.module')(shared);
  require('edit/content/media.module')(vm, AgMedia, $mdDialog, helpers);
  require('edit/content/relation.module')(shared);
  require('edit/content/helpers.module')(shared);
  require('edit/content/history.module')(vm, helpers);
  require('edit/content/main.module')(shared);
  require('edit/content/search.module')(vm, $timeout);
  require('edit/content/source.module')(vm, $mdDialog, $timeout);
  require('edit/content/contributor.module')(vm, $rootScope, Account, Portal, $timeout, Role_Editor);

  vm.onKeyPress = function(event) {

    var languages = $rootScope.viewData.languages;

    // CTRL + SHIFT + S : Save Changes
    if (event.ctrlKey && event.shiftKey && event.keyCode == 19) {
      vm.save();
    }
    // CTRL + SHIFT + L : Change Language
    if (event.ctrlKey && event.shiftKey && event.keyCode == 12) {
      var index = _.findIndex(languages, {
        code: vm.edit.lang
      });
      index++;
      if (index == languages.length) {
        index = 0;
      }
      var language = languages[index];
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
    helpers.isRemote = options.isRemote;
    var routeParams = $location.search();
    vm.restart(true)
      .then(function() {

        if (routeParams.id) {
          vm.getPage(routeParams.id);
          return;
        }
        if (routeParams.template) {
          vm.selectTemplate(routeParams.template);
        }

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

  vm.$broadcast('code:ready');


});
