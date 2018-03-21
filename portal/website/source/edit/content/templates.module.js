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

  vm.restart = function() {

    vm.sidebar.loading = true;

    return helpers.Model.loadTemplates({

    })
      .$promise
      .then(function(result) {

        $location.search({});

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
      });

  };

  vm.selectTemplate = function(template) {

    if (template) {
      if(!template.id){
        template = vm.fuse.search(template)[0];
      }
      vm.template = template;
    } else {
      template = vm.template;
    }

    vm.sidebar.loading = true;
    $location.search({
      template: vm.template.id,
      id: $routeParams.id
    });

    return helpers.Model.loadMany({
      template: template.id
    })
      .$promise
      .then(function(result) {

        vm.pages = null;
        vm.page = null;

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
      });

  };

  vm.$watch('template',function(newValue, oldValue){
    if(newValue == oldValue){
      return;
    }
    if(!newValue){
      return;
    }
    if(vm.template==newValue){
      return;
    }
    vm.selectTemplate(newValue);
  });

};
