var _ = require('lodash');

module.exports = function(Model, app) {

    require('./account/activitiesAdmin')(Model, app);
    require('./account/get')(Model, app);
    require('./account/new')(Model, app);
    require('./account/changePasswordAdmin')(Model, app);
    require('./account/recent')(Model, app);
    require('./account/remove')(Model, app);
    require('./account/roleGet')(Model, app);
    require('./account/roleEdit')(Model, app);
    require('./account/roleAdd')(Model, app);
    require('./account/roleRemove')(Model, app);
    require('./account/roles')(Model, app);
    require('./account/total')(Model, app);
    require('./account/update')(Model, app);

};
