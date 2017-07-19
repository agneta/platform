/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/models/types/moment.js
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
'use strict';

var moment = require('moment-timezone');
var SchemaType = require('warehouse').SchemaType;
var util = require('util');

function SchemaTypeMoment(name, options){
  SchemaType.call(this, name, options);
}

util.inherits(SchemaTypeMoment, SchemaType);

function toMoment(value){
  // FIXME: Something is wrong when using a moment instance. I try to get the
  // original date object and create a new moment object again.
  if (moment.isMoment(value)) return moment(value._d);
  return moment(value);
}

SchemaTypeMoment.prototype.cast = function(value, data){
  value = SchemaType.prototype.cast.call(this, value, data);
  if (value == null) return value;

  var options = this.options;
  value = toMoment(value);

  if (options.language) value = value.locale(options.language);
  if (options.timezone) value = value.tz(options.timezone);

  return value;
};

SchemaTypeMoment.prototype.validate = function(value, data){
  value = SchemaType.prototype.validate.call(this, value, data);
  if (value instanceof Error) return value;
  if (value == null) return value;

  value = toMoment(value);

  if (!value.isValid()){
    return new Error('`' + value + '` is not a valid date!');
  }

  return value;
};

SchemaTypeMoment.prototype.match = function(value, query, data){
  return value ? value.valueOf() === query.valueOf() : false;
};

SchemaTypeMoment.prototype.compare = function(a, b){
  if (a){
    if (b){ // a && b
      return a - b;
    } else { // a && !b
      return 1;
    }
  } else {
    if (b){ // !a && b
      return -1;
    } else { // !a && !b
      return 0;
    }
  }
};

SchemaTypeMoment.prototype.parse = function(value, data){
  if (value) return toMoment(value);
};

SchemaTypeMoment.prototype.value = function(value, data){
  // FIXME: Same as above. Also a dirty hack.
  return value ? value._d.toISOString() : value;
};

SchemaTypeMoment.prototype.q$day = function(value, query, data){
  return value ? value.date() === query : false;
};

SchemaTypeMoment.prototype.q$month = function(value, query, data){
  return value ? value.month() === query : false;
};

SchemaTypeMoment.prototype.q$year = function(value, query, data){
  return value ? value.year() === query : false;
};

SchemaTypeMoment.prototype.u$inc = function(value, update, data){
  if (!value) return value;
  return value.add(update);
};

SchemaTypeMoment.prototype.u$dec = function(value, update, data){
  if (!value) return value;
  return value.subtract(update);
};

module.exports = SchemaTypeMoment;