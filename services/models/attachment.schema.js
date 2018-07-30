module.exports = {
  name: 'Attachment',
  base: 'PersistedModel',
  properties: {
    name: {
      type: 'string',
      required: true
    },
    size: {
      type: 'string',
      required: true
    },
    downloadDisabled: {
      type: 'boolean'
    },
    data: {
      type: 'buffer',
      required: true
    }
  },
  hidden: ['data']
};
