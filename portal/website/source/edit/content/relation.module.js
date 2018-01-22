module.exports = function(options) {

  var vm = options.vm;
  var helpers = options.helpers;
  var relation = {};

  relation.belongsTo = function(field){

    return helpers.Model.loadMany({
      template: field.relation.template
    })
      .$promise
      .then(function(result){
        console.log(result);
        field.options = result.pages;
      });

  };

  relation.hasMany = function(){
  };

  vm.relation = relation;

};
