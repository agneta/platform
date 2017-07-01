const fs = require('fs');
const stream = require('stream');
const S = require('string');
const Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');
const urljoin = require('url-join');
const prettyBytes = require('pretty-bytes');
const mime = require('mime-types');

module.exports = function(Model, app) {


    var config = app.get('storage');

    if (!config) {
        return;
    }

    Model.__tempUploads = 'temp/uploads/';
    Model.__bucket = config.buckets.media;

    Model.io = app.io.create({
        name: 'media',
        auth: {
            allow: ['editor']
        }
    });

    app.helpers.mixin("disableAllMethods", Model);

    //------------------------------------------------------------------

    require('./media/helpers/fixParams')(Model, app);
    require('./media/helpers/fixPath')(Model, app);
    require('./media/helpers/getMediaPath')(Model, app);
    require('./media/helpers/images')(Model, app);
    require('./media/helpers/initOperation')(Model, app);
    require('./media/helpers/moveObject')(Model, app);
    require('./media/helpers/prepareFile')(Model, app);
    require('./media/helpers/prepareObject')(Model, app);
    require('./media/helpers/sendFile')(Model, app);
    require('./media/helpers/uploadData')(Model, app);


    require('./media/add')(Model, app);
    require('./media/beforeSave')(Model, app);
    require('./media/deleteObject')(Model, app);
    require('./media/details')(Model, app);
    require('./media/list')(Model, app);
    require('./media/newFolder')(Model, app);
    require('./media/search')(Model, app);
    require('./media/updateFile')(Model, app);
    require('./media/search')(Model, app);
    require('./media/updateFile')(Model, app);
    require('./media/uploadFile')(Model, app);
    require('./media/uploadFiles')(Model, app);

};
