/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/moment.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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
