const cheerio = require('cheerio');

module.exports = function(Model) {
  Model.html = function(html) {
    if (!html) {
      return;
    }
    if (!html.length) {
      return;
    }
    var $ = cheerio.load(html);
    return $.html(changeTag.call($('body'), $, 'div'));
  };

  function changeTag($, tag) {
    var elm = this[0];
    if (!elm) {
      return;
    }
    var replacement = $('<' + tag + '>');
    replacement.attr(elm.attribs);
    replacement.data(this.data());
    replacement.append(this.children());
    return replacement;
  }
};
