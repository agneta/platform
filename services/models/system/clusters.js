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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2x1c3RlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjbHVzdGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTJCQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsS0FBVSxFQUFFLEdBQW1CO0lBQ3ZELEtBQUssQ0FBQyxRQUFRLEdBQUc7UUFDZixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztZQUNwQyxPQUFPLEVBQUUsV0FBVztTQUNyQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsTUFBVztZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BCLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRTthQUNuQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7SUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRTtRQUM3QixXQUFXLEVBQUUsY0FBYztRQUMzQixPQUFPLEVBQUUsRUFBRTtRQUNYLE9BQU8sRUFBRTtZQUNQLEdBQUcsRUFBRSxRQUFRO1lBQ2IsSUFBSSxFQUFFLFFBQVE7WUFDZCxJQUFJLEVBQUUsSUFBSTtTQUNYO1FBQ0QsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsV0FBVztTQUNsQjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyJ9