var path = require('path');
var _ = require('lodash');
var hljs = require('highlight.js');

module.exports = function(locals) {

    var project = locals.project;

    hljs.configure({
      classPrefix: 'hljs-'
    });

    project.extend.helper.register('code', function(name, value) {

        var result = hljs.highlight(name, value);
        result = '<div class="hljs">' + result.value + '</div>';
        return result;
    });

};
