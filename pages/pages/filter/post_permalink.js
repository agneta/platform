
var _ = require('lodash');
var util = require('hexo-util');
var pathFn = require('path');
var Permalink = util.Permalink;
var permalink;

function postPermalinkFilter(data){
  /* jshint validthis: true */
  var config = this.config;
  var meta = {
    id: data.id || data._id,
    title: data.slug,
    name: pathFn.basename(data.slug),
    // Change to empty string because post title is an object now
    post_title: util.slugize('', {transform: 1})
  };

  if (!permalink || permalink.rule !== config.permalink){
    permalink = new Permalink(config.permalink);
  }

  var keys = Object.keys(data);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    if (meta.hasOwnProperty(key)) continue;

    // Use Object.getOwnPropertyDescriptor to copy getters to avoid "Maximum call
    // stack size exceeded" error
    Object.defineProperty(meta, key, Object.getOwnPropertyDescriptor(data, key));
  }

  return permalink.stringify(_.defaults(meta, config.permalink_defaults));
}

module.exports = postPermalinkFilter;
