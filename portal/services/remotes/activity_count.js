module.exports = function(Model, app) {


  Model.remoteMethod(
      'details', {
          description: 'Get Count Details',
          accepts: [{
              arg: 'feed',
              type: 'string',
              required: true
          }, {
              arg: 'period',
              type: 'string',
              required: true
          }, {
              arg: 'value',
              type: 'number',
              required: false
          }, {
              arg: 'year',
              type: 'number',
              required: false
          }],
          returns: {
              arg: 'result',
              type: 'object',
              root: true
          },
          http: {
              verb: 'get',
              path: '/details'
          },
      }
  );

  Model.remoteMethod(
    'totalsByType', {
        description: '',
        accepts: [{
            arg: 'type',
            type: 'string',
            required: true
        }, {
            arg: 'period',
            type: 'string',
            required: true
        }, {
            arg: 'value',
            type: 'number',
            required: false
        }, {
            arg: 'year',
            type: 'number',
            required: false
        }],
        returns: {
            arg: 'result',
            type: 'object',
            root: true
        },
        http: {
            verb: 'get',
            path: '/totals-by-type'
        },
    }
);

Model.remoteMethod(
    'totals', {
        description: '',
        accepts: [{
            arg: 'feed',
            type: 'string',
            required: true
        }, {
            arg: 'period',
            type: 'string',
            required: true
        }, {
            arg: 'value',
            type: 'number',
            required: false
        }, {
            arg: 'year',
            type: 'number',
            required: false
        }],
        returns: {
            arg: 'result',
            type: 'object',
            root: true
        },
        http: {
            verb: 'get',
            path: '/totals'
        },
    }
);

Model.beforeRemote('totals', checkPeriod);
Model.beforeRemote('totalsByType', checkPeriod);

function checkPeriod(ctx, instance, next) {

    var period = ctx.req.query.period;

    switch (period) {
        case 'year':
        case 'month':
        case 'week':
        case 'dayOfYear':
            break;
        default:

            var err = new Error('Entered an invalid period');
            err.statusCode = 400;
            err.code = 'INVALID_PERIOD';

            return next(err);

    }

    next();

}

}
