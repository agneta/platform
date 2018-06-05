/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/moment.js
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

module.exports = function(){

  moment.prototype.hourOfYear = function(value) {

    if (value) {
      var dayOfYear = Math.ceil(value / 24);
      var hour = value % 24;
      if (hour === 0) {
        dayOfYear += 1;
      }
      this.dayOfYear(dayOfYear);
      this.hour(hour);
      return this;
    }

    return ((this.dayOfYear() - 1) * 24) + this.hour();

  };

/* Test
var m = moment().utc().dayOfYear(100).hour(30);
var hourOfYear = m.hourOfYear();
console.log(hourOfYear);
console.log(m.hourOfYear(2929).hourOfYear());
*/

};
