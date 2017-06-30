var util = require('hexo-util');
module.exports = function(locals) {

    var project = locals.project;

    function trim(str) {
        return str.trim();
    }

    project.extend.helper.register('strip_html', util.stripHTML);
    project.extend.helper.register('trim', trim);
    project.extend.helper.register('word_wrap', util.wordWrap);
    project.extend.helper.register('truncate', util.truncate);

};
