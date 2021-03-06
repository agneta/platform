module.exports = {
  name: 'System',
  plural: 'System',
  base: 'Model',
  idInjection: true,
  options: {},
  validations: [],
  acls: [
    {
      accessType: '*',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'DENY'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: 'administrator',
      permission: 'ALLOW'
    }
  ],
  methods: {}
};
