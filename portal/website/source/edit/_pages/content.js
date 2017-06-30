$scope.dragControlListeners = {
    accept: function(sourceItemHandleScope, destSortableScope) {
        return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
    },
    itemMoved: function(event) {

    },
    orderChanged: function(event) {},
    containment: '.data-node',
    containerPositioning: 'relative'
};

$scope.removeValue = function(key, data) {
    data = data.__value || data;
    if (_.isObject(data)) {
        delete data[key];
    }
    if (_.isArray(data)) {
        data.splice(key, 1);
    }

    $scope.save(true);

};

$scope.addValue = function(field, parent, key) {

    var parentValue = parent.__value || parent;

    if (field.fields) {

        var childField = _.find(field.fields, {
            name: key
        });

        if (!childField) {
            return console.error('Must provide the right key for the field:', field, key);
        }

        var value = fieldValue(childField);
        key = pushValue(value);

        fixValue(
            parent,
            key,
            childField
        );
    }

    function pushValue(value) {

        switch (field.type) {
            case 'array':
                var length = parentValue.length;
                parentValue.push(value);
                return length;
            case 'object':
            case 'media':
                if (!key) {
                    console.error('Must provide key for object', field);
                }
                parentValue[key] = value;
                return key;
            default:
                console.error('Cannot add value to an unrecognised type: ', field.type);
                break;
        }

    }

    $scope.save(true);

};

$scope.objectField = function(childField, parentField, parent, key) {

    var parentValue = parent.__value;
    var validators = childField.validators;
    var required = validators && validators.required;

    if (required && !parentValue[key]) {
        $scope.addValue(parentField, parent, key);
    }

};

$scope.onFieldSelect = function(parentField, parentData, childField, key) {
    for (var name in childField.options) {
        var option = childField.options[name];
        if (option.require) {
            if (name == key) {
                $scope.addValue(parentField, parentData, option.require);
            } else {
                $scope.removeValue(option.require, parentData);
            }
        }
    }
};

$scope.excerpt = function excerpt(data) {

    var res = $scope.edit.lng(data);
    if (res) {
        return res;
    }

    if (angular.isArray(data)) {
        return excerpt(data[0]);
    }

    if (angular.isObject(data)) {
        return excerpt(data[Object.keys(data)[0]]);
    }

    return data;
};
