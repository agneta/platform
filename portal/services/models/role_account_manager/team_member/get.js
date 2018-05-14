module.exports = function(Model) {

  Model.teamMemberGet = function(accountId) {

    var Role_Team_Member = Model.projectModel('Role_Team_Member');
    return Role_Team_Member
      .findOne({
        where:{
          accountId: accountId
        }
      });

  };

  Model.remoteMethod(
    'teamMemberGet', {
      description: '',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      }, {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/team-member-get'
      }
    }
  );

};
