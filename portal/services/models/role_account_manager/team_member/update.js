const _ = require('lodash');

module.exports = function(Model) {

  Model.teamMemberUpdate = function(id, data) {

    var Role_Team_Member = Model.projectModel('Role_Team_Member');

    return Role_Team_Member
      .findById(id)
      .then(function(result) {
        if(!result){
          return Promise.reject({
            statusCode: 400,
            message: 'Team member not found'
          });
        }
        return result.updateAttributes(
          _.pick(data,['position'])
        );
      });
  };

  Model.remoteMethod(
    'teamMemberUpdate', {
      description: '',
      accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      }, {
        arg: 'data',
        type: 'object',
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
        path: '/team-member-update'
      }
    }
  );

};
