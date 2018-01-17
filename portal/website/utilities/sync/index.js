
module.exports = {
  run: function() {

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
      name: 'search',
      title: 'Search Fields'
    }]
  }]
};
