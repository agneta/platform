var moment = require('moment');
var langs = {
    en: "en",
    gr: "el"
}

module.exports = function(locals) {

    var project = locals.project;

    function init(date, format) {

        if (date.toISOString) {
            date = date.toISOString();
        }

        var localLocale = moment(date);
        localLocale.locale(langs[project.site.lang] || "en");

        return localLocale.format(format);
    }

    ////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////

    project.extend.helper.register('moment', function(date, format) {

        return init(date, format);

    });

    ////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////

    project.extend.helper.register('dateFormat', function(options) {

        var mDate = moment();

        if (options.date) {
            mDate.date(options.date);
        }

        if (options.month) {
            mDate.month(options.month);
        }

        if (options.year) {
            mDate.year(options.year);
        }

        return init(mDate, options.format);
    });

    ////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////

    project.extend.helper.register('time_now', function() {
        return moment().format();
    });

    ////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////

    project.extend.helper.register('get_date', function(date) {
        return init(date, 'LL');
    });

    ////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////

    project.extend.helper.register('get_month', function(date) {
        return init(date, 'MMM');
    });

    ////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////

    project.extend.helper.register('month_f', function(date) {
        return init(date, 'MMMM');
    });

    ////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////

    project.extend.helper.register('day_f', function(date) {
        return init(date, 'dddd');
    });

    ////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////

    project.extend.helper.register('day_n', function(date) {
        return init(date, 'DD');
    });

}
