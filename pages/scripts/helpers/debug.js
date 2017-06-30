var util = require('util');

module.exports = function(locals) {

    var project = locals.project;

    // this solves circular reference in object
    function inspectObject(object, options) {
        var result = util.inspect(object, options);
        console.log(result);
        return result;
    }

    exports.inspectObject = inspectObject;

    project.extend.helper.register('inspect', inspectObject);

};
