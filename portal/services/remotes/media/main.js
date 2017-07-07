const path = require('path');

module.exports = function(Model, app, options) {

    Model.__tempUploads = path.join('temp/uploads', options.name);
    Model.__bucket = options.bucket;

    app.helpers.mixin("disableAllMethods", Model);

    //------------------------------------------------------------------

    require('./helpers/fixParams')(Model, app);
    require('./helpers/fixPath')(Model, app);
    require('./helpers/getMediaPath')(Model, app);
    require('./helpers/images')(Model, app);
    require('./helpers/initOperation')(Model, app);
    require('./helpers/moveObject')(Model, app);
    require('./helpers/prepareFile')(Model, app);
    require('./helpers/prepareObject')(Model, app);
    require('./helpers/sendFile')(Model, app);
    require('./helpers/uploadData')(Model, app);


    require('./add')(Model, app);
    require('./beforeSave')(Model, app);
    require('./deleteObject')(Model, app);
    require('./details')(Model, app);
    require('./list')(Model, app);
    require('./newFolder')(Model, app);
    require('./search')(Model, app);
    require('./updateFile')(Model, app);
    require('./search')(Model, app);
    require('./updateFile')(Model, app);
    require('./uploadFile')(Model, app);
    require('./uploadFiles')(Model, app);

};
