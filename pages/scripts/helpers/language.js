var ejs = require('ejs');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;
    var app = locals.app;

    /////////////////////////////////////////////////////////////////
    // GET LANGUAGE
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('lng', function(obj, lang, strict) {

        var res;

        lang = lang || project.site.lang;

        if (_.isObject(obj)) {
            obj = obj.__value || obj;
        }

        if (typeof obj == "string") {

            var objPath = obj.split('.');
            var lngName = objPath[0];

            objPath.shift();
            objPath = objPath.join('.');

            var dataPath = 'lng/' + lngName;
            var dataResult;

            if (this.has_data(dataPath)) {
                var data = this.get_data(dataPath);
                dataResult = _.get(data, objPath);
            }

            if (!dataResult) {
                return obj;
            }

            obj = dataResult;
        }

        if (!obj) {
            return null;
        }

        res = obj[lang];

        if (!res) {
            if (strict) {
                return null;
            }
            res = obj.en || obj.gr;
        }

        return res;
    });

    /////////////////////////////////////////////////////////////////
    // GET TITLE
    /////////////////////////////////////////////////////////////////


    project.extend.helper.register('get_title', function(page, lang, strict) {

        var title = page.title;

        if (title) {
            var lng = this.lng(title, lang, strict);
            if (lng) {
                return lng;
            }
        }

        return null;
    });

    /////////////////////////////////////////////////////////////////
    // HAS LANGUAGE AVAILABLE
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('has_lang', function(page, lang) {

        lang = lang || project.site.lang;
        var title = this.get_title(page, lang, true);
        return title ? true : false;
    });


    /////////////////////////////////////////////////////////////////
    // Render EJS template code
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('render_template', function(content, data) {
        if (!content) {
            return;
        }
        return ejs.render(content, data);
    });

    /////////////////////////////////////////////////////////////////
    // Scan Object for language proprties
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('lngScan', function(mainObj,lng) {

        var self = this;

        function scan(obj) {

            if (!obj) {
                return;
            }

            if (typeof obj !== 'object') {
                return;
            }

            for (var key in obj) {

                var source = obj[key];
                var res = self.lng(source,lng);


                if (res) {

                    obj[key] = res;

                } else {
                    scan(source);
                }
            }
        }

        var result = _.cloneDeep(mainObj);
        scan(result);

        return result;
    });

};
