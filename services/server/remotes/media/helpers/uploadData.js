
module.exports = function(Model) {

    Model.__uploadData = function(req) {

        var params = req.body;

        params.dir = Model.__fixPath(params.dir || '');

        if (params.location) {
            params.location = Model.__fixPath(params.location || '');
        }

        return params;

    };

};
