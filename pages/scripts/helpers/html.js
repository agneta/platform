module.exports = function(locals) {

    var project = locals.project;

    //////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////

    project.extend.helper.register('block_attr', function(x) {
        if (x == 0) {
            return "";
        }
        return "hidden";
    });

    //////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////


    function attr(obj, key) {
        if (!obj[key]) {
            return "";
        }
        var val = obj[key];
        if (val === true) {
            return key;
        }
        return key + '="' + obj[key] + '"';
    }

    project.extend.helper.register('attr', attr);

    //////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////

    project.extend.helper.register('attrs', function(attrs) {
        var res = "";
        for (var key in attrs) {
            var obj = attrs[key];
            res += " " + attr(attrs, key);
        }
        return res;
    });


    //////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////

    project.extend.helper.register('_id', function(obj) {
        if (!obj.id) {
            return "";
        }

        return 'id="' + obj.id + '"';
    });

}