module.exports = function(Model) {


  Model.__saveFile = function(options) {

    var relation = options.instance[options.prop];

    relation(function(){
      console.log(arguments);
    });
    return Promise.resolve();
    return relation()
      .then(function(attachment){
        if(!attachment){
          return relation.create({

          });
        }

        return relation.update({

        });
      });

  };

};
