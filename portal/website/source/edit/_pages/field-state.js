(function() {

    var focused = null;
    $scope.fieldFocus = function(data) {
        if (focused) {
            delete focused.__focused;
        }
        data.__focused = true;
        focused = data;
    };

    var hovered = null;
    $scope.fieldHover = function(data) {
        if (hovered) {
            delete hovered.__hovered;
        }
        data.__hovered = true;
        hovered = data;
    };

    $scope.clearHiddenData = function() {

        if (hovered) {
            delete hovered.__hovered;
        }
        if (focused) {
            delete focused.__focused;
        }
    };

})();
