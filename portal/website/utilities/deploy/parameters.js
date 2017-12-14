module.exports = [{
  name: 'destination',
  title: {
    en: 'Destination',
    gr: 'Προορισμός'
  },
  type: 'radio',
  values: [{
    name: 'staging',
    title: 'Staging'
  }, {
    name: 'production',
    title: 'Production',
  }]
}, {
  name: 'promote',
  title: 'What to deploy?',
  type: 'checkboxes',
  values: [{
    name: 'pages',
    title: 'Pages'
  }, {
    name: 'build',
    title: 'Build'
  }, {
    name: 'services',
    title: {
      en: 'Services',
      gr: 'Υπηρεσίες'
    }
  }, {
    name: 'search',
    title: 'Search Keywords'
  }, {
    name: 'media',
    title: {
      en: 'Media',
      gr: 'Πολυμέσα'
    },
    if: {
      prop: 'destination',
      equals: 'production'
    }
  }, {
    name: 'lib',
    title: 'Libraries',
    if: {
      prop: 'destination',
      equals: 'production'
    }
  }]
}];
