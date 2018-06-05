/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/common.js
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

var Pattern = require('hexo-util').Pattern;
var moment = require('moment-timezone');

var DURATION_MINUTE = 1000 * 60;

function isTmpFile(path){
  var last = path[path.length - 1];
  return last === '%' || last === '~';
}

function isHiddenFile(path){
  if (path[0] === '_') return true;
  return /\/_/.test(path);
}
var exports = module.exports = {};
exports.ignoreTmpAndHiddenFile = new Pattern(function(path){
  if (isTmpFile(path) || isHiddenFile(path)) return false;
  return true;
});

exports.isTmpFile = isTmpFile;
exports.isHiddenFile = isHiddenFile;

exports.toDate = function(date){
  if (!date || moment.isMoment(date)) return date;

  if (!(date instanceof Date)){
    date = new Date(date);
  }

  if (isNaN(date.getTime())) return;

  return date;
};

exports.timezone = function(date, timezone){
  if (moment.isMoment(date)) date = date.toDate();

  var offset = date.getTimezoneOffset();
  var ms = date.getTime();
  var target = moment.tz.zone(timezone).offset(ms);
  var diff = (offset - target) * DURATION_MINUTE;

  return new Date(ms - diff);
};
