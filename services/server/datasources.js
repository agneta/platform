 var _ = require('lodash');

 module.exports = function(app) {

     var db = app.get('db');

     result = {
         db: _.extend({
             name: "db",
             connector: "mongodb"
         }, db)
     };

     return result;
 };
