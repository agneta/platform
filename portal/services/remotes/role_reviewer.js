module.exports = function(Model, app) {

    app.helpers.mixin("disableAllMethods", Model);

};
