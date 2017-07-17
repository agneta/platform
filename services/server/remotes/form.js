
module.exports = function(Model, app) {

    require("../mixins/disableAllMethods")(Model);

    var client = app.get('options');
    client = client.web || client.client;
    var clientHelpers = client.app.locals;
    if (!clientHelpers.has_data('form/services')) {
        return;
    }

    var formServices = clientHelpers.get_data('form/services');

    if (!formServices) {
        return;
    }

    Model.formServices = formServices;
    Model.clientHelpers = clientHelpers;

    require('./form/checkProperties')(Model, app);
    require('./form/newMethod')(Model, app);
    require('./form/generate')(Model, app);
    require('./form/new')(Model, app);

};
