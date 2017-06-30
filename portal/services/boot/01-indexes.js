module.exports = function(app) {

    var db;

    return new Promise(function(resolve, reject) {
        app.datasources.db.connector.connect(function(err, _db) {
            db = _db;
            if (err) {
                return reject(err);
            }
            resolve();
        });
    }).then(function() {

        return db.collection('Media').createIndex({
            location: 1
        }, {
            unique: true,
            name: "location"
        });
    });


};
