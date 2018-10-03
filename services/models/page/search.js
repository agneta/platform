module.exports = function(Model, app) {
  Model.search = function(text, keywords, req) {
    var result;
    return Model.engine
      .find({
        keywords: keywords,
        language: req.query.language,
        fields: {
          title_keywords: false,
          description_keywords: false,
          content: false,
          content_keywords: false
        }
      })
      .then(function(_result) {
        result = _result;

        if (!result.items) {
          return;
        }

        var pages = result.items;

        if (!req.session) {
          return;
        }

        var feeds = [];
        var value;
        //console.log(req.session);

        req.session.searchPages = req.session.searchPages || {};

        for (var page of pages) {
          value = app.helpers.slugifyPath(page.path);
          if (req.session.searchPages[value]) {
            continue;
          }
          req.session.searchPages[value] = true;
          feeds.push({
            value: value,
            type: 'search_page'
          });
        }

        // Keywords

        req.session.searchKeywords = req.session.searchKeywords || {};

        for (var keyword of keywords) {
          value = keyword.value || keyword;
          if (req.session.searchKeywords[value]) {
            continue;
          }
          req.session.searchKeywords[value] = true;
          feeds.push({
            value: value,
            type: 'search_keyword'
          });
        }

        if (feeds.length) {
          //console.log('About to create', feeds);

          var options = {
            feeds: feeds,
            action: 'search',
            req: req,
            data: {
              text: text
            }
          };

          app.models.Activity_Item.new(options);
        }
      })
      .then(function() {
        return result;
      });
  };
};
