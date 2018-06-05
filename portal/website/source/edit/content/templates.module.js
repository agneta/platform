/*global Fuse:true*/

module.exports = function(shared) {

  var vm = shared.vm;
  var helpers = shared.helpers;
  var $routeParams = shared.$routeParams;
  var $location = shared.$location;
  var $timeout = shared.$timeout;

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

  vm.restart = function(skipClear) {

    if(vm.sidebar.loading){
      return;
    }

    vm.sidebar.loading = true;

    return helpers.Model.loadTemplates()
      .$promise
      .then(function(result) {
        if (!skipClear) {
          $location.search({});
        }
        vm.itemsLoaded = result.templates;
        vm.templates = null;
        vm.templates = vm.itemsLoaded;
        vm.template = null;
        vm.page = null;
        vm.pages = null;
        vm.fuse = new Fuse(vm.itemsLoaded, fuseOptions);

        $timeout();

      })
      .finally(function() {
        vm.sidebar.loading = false;
      })
      .catch(console.error);

  };

  vm.selectTemplate = function(template) {

    if (template) {
      if (!template.id) {
        template = vm.fuse.search(template)[0];
      }
      var currentId = vm.template;
      if (currentId) {
        currentId = currentId.id || currentId;
      }
      if (template.id == currentId) {
        //return;
      }
    } else {
      template = vm.template;
    }
    if(!template.id){
      return;
    }
    if(vm.template && (vm.template.id == template.id)){
      return;
    }

    vm.sidebar.loading = true;
    return helpers.Model.loadTemplate({
      template: template.id
    })
      .$promise
      .then(function(template) {
        vm.template = template;
        return vm.getTemplateItems();
      })
      .then(function() {
        $location.search({
          template: vm.template.id,
          id: $routeParams.id
        });
      })
      .finally(function() {
        vm.sidebar.loading = false;
      });

  };

  vm.getTemplateItems = function() {
    console.log(vm.template);
    var query = {
      template: vm.template.id,
    };

    if (vm.template) {
      query.order = vm.template.order;
    }

    vm.sidebar.loading = true;

    return helpers.Model.loadMany(query)
      .$promise
      .then(function(result) {

        vm.pages = null;
        if (!vm.template || vm.template.id != vm.template.id) {
          vm.page = null;
        }

        $timeout(function() {

          helpers.checkPages(result.pages);
          vm.itemsLoaded = result.pages;
          vm.pages = vm.itemsLoaded;
          vm.templates = null;

          vm.fuse = new Fuse(vm.itemsLoaded, fuseOptions);
        }, 10);
      })
      .finally(function() {
        vm.sidebar.loading = false;
      })
      .catch(console.error);

  };

  vm.$watch('template.order', function(newValue, oldValue) {
    if (!newValue) {
      return;
    }
    if (newValue != oldValue) {
      vm.getTemplateItems();
    }
  });
  vm.$watch('template', function(newValue, oldValue) {
    if (newValue == oldValue) {
      return;
    }
    if (!newValue) {
      return;
    }
    if (oldValue) {
      if (oldValue.id == newValue.id) {
        return;
      }
    }

    vm.selectTemplate(newValue);
  });

};
