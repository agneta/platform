var _ = require("lodash");

module.exports = function(Model, app) {

    app.helpers.mixin("disableAllMethods", Model);

};
