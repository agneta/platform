var _ = require('lodash');

module.exports = function(Model) {
  Model.add = function(data) {
    var attributes = {
      //
      title: data.title.value,
      title_keywords: Model._getKeywords(data.title.positions),
      //
      path: data.path,
      lang: data.language
    };

    var fields = [].concat(data.title);

    if (data.description) {
      attributes.description = data.description.value;
      attributes.description_keywords = Model._getKeywords(
        data.description.positions
      );

      fields = fields.concat(data.description);
    }

    if (data.content) {
      var content = _.map(data.content, 'value');
      var content_keywords = _.reduce(
        data.content,
        function(result, value) {
          return result.concat(value.positions);
        },
        []
      );

      content_keywords = Model._getKeywords(content_keywords);

      attributes.content = content;
      attributes.content_keywords = content_keywords;

      fields = fields.concat(data.content);
    }

    return Model._add({
      where: {
        path: data.path
      },
      fields: fields,
      attributes: attributes,
      language: data.language
    });
  };
};
