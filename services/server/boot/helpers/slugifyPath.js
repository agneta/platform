const S = require('string');
const path = require('path');

module.exports = function(pagePath) {

  pagePath = path.normalize(pagePath);
  pagePath = pagePath.split('/');

  if (!pagePath[0].length) {
    pagePath.shift();
  }

  if (!pagePath[pagePath.length - 1].length) {
    pagePath.pop();
  }

  for (var i in pagePath) {
    pagePath[i] = S(pagePath[i]).slugify().s;
  }

  return pagePath.join('/');
};
