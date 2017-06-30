module.exports = function(Model, app) {


Model.remoteMethod(
    'add', {
        description: 'Add page data with keywords',
        accepts: [{
            arg: 'data',
            type: 'object',
            required: true
        }],
        returns: {
            arg: 'result',
            type: 'object',
            root: true
        },
        http: {
            verb: 'post',
            path: '/add'
        }
    }
);

};
