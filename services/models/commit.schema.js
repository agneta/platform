module.exports = {
  name: 'Commit',
  base: 'Model',
  idInjection: true,
  properties: {
    message: {
      type: 'string',
      required: true
    },
    hash: {
      type: 'string',
      required: true
    },
    date: {
      type: 'date',
      required: true
    }
  }
};
