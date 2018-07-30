module.exports = {
  name: 'AccountRole',
  base: 'PersistedModel',
  properties: {
    status: {
      type: 'String',
      required: true,
      default: 'active'
    }
  },
  validations: [],
  relations: {}
};
