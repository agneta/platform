module.exports = function(util) {
  return {
    run: function(parameters) {

      parameters.options = parameters.options || {};

      require('./media')(util, parameters);
      require('./pages')(util, parameters);
      require('./data')(util, parameters);
    },
    parameters: [{
      name: 'options',
      title: 'Options',
      type: 'checkboxes',
      values: [{
        name: 'media',
        title: 'Media'
      },
      {
        name: 'pages',
        title: 'Pages'
      }, {
        name: 'data',
        title: 'Data'
      }
      ]
    }]
  };
};
