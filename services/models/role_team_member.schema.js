module.exports = {
  name: 'Role_Team_Member',
  base: 'AccountRole',
  idInjection: true,
  options: {},
  properties: {
    position: {
      type: 'String',
      required: false
    },
    about: {
      type: 'String',
      required: false
    }
  },
  validations: [],
  mixins: {},
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
      principalId: 'team_member',
      permission: 'ALLOW'
    }
  ],
  methods: {},
  http: {
    path: 'role/team-member'
  }
};
