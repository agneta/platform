agneta.directive('editItemMenu', function($mdMenu,$element) {
  var vm = this;

  agneta.contextMenu({
    template: 'edit-item-menu.html',
    scope: vm,
    element: $element
  });

});
