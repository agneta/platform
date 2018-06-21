"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (Model, app) {
    Model.clusters = function () {
        return app.models.Process_Server.find({
            include: 'processes'
        }).then(function (result) {
            console.log(result);
            return {
                list: app.k8s.config.getClusters()
            };
        });
    };
    Model.remoteMethod('clusters', {
        description: 'Get clusters',
        accepts: [],
        returns: {
            arg: 'result',
            type: 'object',
            root: true
        },
        http: {
            verb: 'post',
            path: '/clusters'
        }
    });
};
//# sourceMappingURL=clusters.js.map