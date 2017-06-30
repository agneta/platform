var moment = require('moment-timezone');
var isMoment = moment.isMoment;
var isDate = require('util').isDate;

module.exports = function(locals) {

    var project = locals.project;

    function output(date, format, lang, timezone) {
        if (date == null) date = moment();
        if (!isMoment(date)) date = moment(isDate(date) ? date : new Date(date));

        if (lang) date = date.locale(lang);
        if (timezone) date = date.tz(timezone);

        return date.format(format);
    }

    function toISOString(date) {
        if (date == null) {
            return new Date().toISOString();
        }

        if (date instanceof Date || isMoment(date)) {
            return date.toISOString();
        }

        return new Date(date).toISOString();
    }

    function dateHelper(date, format) {
        /* jshint validthis: true */
        var config = this.config;
        return output(date, format || config.date_format, getLanguage(this), config.timezone);
    }

    function timeHelper(date, format) {
        /* jshint validthis: true */
        var config = this.config;
        return output(date, format || config.time_format, getLanguage(this), config.timezone);
    }

    function fullDateHelper(date, format) {
        /* jshint validthis: true */
        if (format) {
            return output(date, format, getLanguage(this), this.config.timezone);
        } else {
            return this.date(date) + ' ' + this.time(date);
        }
    }

    function timeTagHelper(date, format) {
        /* jshint validthis: true */
        var config = this.config;
        return '<time datetime="' + toISOString(date) + '">' + this.date(date, format, getLanguage(this), config.timezone) + '</time>';
    }

    function getLanguage(ctx) {
        return ctx.page.lang || ctx.page.language || ctx.config.language;
    }

    project.extend.helper.register('date', dateHelper);
    project.extend.helper.register('date_xml', toISOString);
    project.extend.helper.register('time', timeHelper);
    project.extend.helper.register('full_date', fullDateHelper);
    project.extend.helper.register('time_tag', timeTagHelper);
    project.extend.helper.register('moment', moment);

};
