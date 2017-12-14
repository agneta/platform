module.exports = [{
  name: 'target',
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
  name: 'source',
  title: {
    en: 'What to deploy?',
    gr: 'Τι να μεταφέρετε;'
  },
  type: 'checkboxes',
  values: [{
    name: 'pages',
    title: {
      en: 'Pages',
      gr: 'Σελίδες'
    }
  }, {
    name: 'services',
    title: {
      en: 'Services',
      gr: 'Υπηρεσίες'
    }
  }, {
    name: 'search',
    title: {
      en: 'Search Data',
      gr: 'Στοιχεία αναζήτησης'
    }
  }, {
    name: 'media',
    title: {
      en: 'Media',
      gr: 'Πολυμέσα'
    },
    if: {
      prop: 'target',
      equals: 'production'
    }
  }]
}];
