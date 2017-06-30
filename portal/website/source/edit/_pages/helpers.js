function setFilePath(file, location) {
    file.location = fixPath(location);
}

function toast(message) {
    $mdToast.show(
        $mdToast.simple()
        .textContent(message)
        .position('bottom right')
        .hideDelay(3000)
    );
}

function fixPath(path) {
    path = agneta.urljoin(path, '/');
    if (path[0] == '/') {
        return path.substring(1);
    }
    return path;
}

function getBasePath(field) {
    var base = $scope.page.path;
    return fixPath(base);
}

function dataValue(obj) {
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
}

function fieldValue(field) {

    var value;

    switch (field.type) {
        case 'select':
        case 'value':
            return '';
        case 'text':
        case 'text-rich':
        case 'text-single':
            return {
                en: ''
            };
        case 'boolean':
            return false;
        case 'media':
            return {};
        case 'array':
            return [];
        case 'object':
            return {};
    }

    console.error('unrecognised type: ', field.type || field);

}

//------------------------------------------

function fixValue(parent, key, childField) {

    var parentValue = dataValue(parent);
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

    var childValue = angular.copy(dataValue(child));

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
}

function getDataPath(source) {
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
}

function structureData(field, data) {

    var iteratee = dataValue(data);

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
            var result = fixValue(data, key, childField);
            if (result) {
                structureData(childField, result);
            }
        }
    }

}

//------------------------------------------

function setData(data) {
    $scope.page.data = null;
    $timeout(function() {
        $scope.page.data = data;
    }, 100);
}
