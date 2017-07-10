const Promise = require('bluebird');

module.exports = function(Model, app) {

    Model.observe('before save', function(ctx) {

        var instance = ctx.currentInstance || ctx.instance;
        var data = ctx.data || instance;

        return Promise.resolve()
            .then(function() {
                if (instance.type == 'folder') {
                    return;
                }

                if (!instance.size && !data.size) {

                    var headParams = {
                        Bucket: Model.__bucket.name,
                        Key: instance.location
                    };
                    return app.storage.s3.headObjectAsync(headParams)
                        .then(function(storageObjectHead) {
                            data.size = storageObjectHead.ContentLength;
                            //console.log('size', instance.location);
                        })
                        .catch(function(err) {
                            console.log('error', instance, headParams);
                            console.log(err);
                            throw err;
                        });
                }

            })
            .then(function() {
                return Model.__images.onSaveBefore(ctx);
            });

    });

};
