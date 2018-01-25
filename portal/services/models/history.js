const Promise = require('bluebird');

module.exports = function(Model,app) {

  Model.add = function(options){

    return Model.create({
      refId: options.id,
      collection: options.model.modelName,
      timestamp: new Date(),
      message: options.message,
      diff: options.diff,
      accountId: options.req.accessToken.userId,
      data: options.data
    })
      .then(function(){

        return app.helpers.limitCollection({
          where:{
            collection: options.model.modelName,
            refId: options.id
          },
          prop: 'timestamp',
          isDate: true,
          model: Model,
          limit: 40
        });

      });

  };

  Model.load = function(options){

    return Model.find({
      where:{
        refId: options.id,
        collection: options.model.modelName,
      },
      fields:{
        id: true,
        accountId: true,
        timestamp: true,
        message: true,
        diff: true
      },
      order: 'timestamp DESC'
    })
      .then(function(items) {
        return Promise.map(items,function(item){

          item.diff = item.diff || [];

          if(!item.message){
            var lines  = ['Changes:'];
            for(var change of item.diff){
              if(lines.length>4){
                lines.push('...');
              }
              lines.push(`${change.path.join('.')}: ${change.lhs}`);
            }
            item.message = lines.join('\n');
          }

          return item;
        });
      });

  };
};
