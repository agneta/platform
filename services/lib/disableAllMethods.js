/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/disableAllMethods.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

module.exports = function(Model, options) {
  options = options || {};

  var defaultMethods = [ { name: 'create', isStatic: true },
    { name: 'patchOrCreate', isStatic: true },
    { name: 'replaceOrCreate', isStatic: true },
    { name: 'upsertWithWhere', isStatic: true },
    { name: 'exists', isStatic: true },
    { name: 'findById', isStatic: true },
    { name: 'replaceById', isStatic: true },
    { name: 'find', isStatic: true },
    { name: 'findOne', isStatic: true },
    { name: 'updateAll', isStatic: true },
    { name: 'deleteById', isStatic: true },
    { name: 'count', isStatic: true },
    { name: 'patchAttributes', isStatic: false },
    { name: 'createChangeStream', isStatic: true } ];

  var defaultRelationMethods = [
    '__findById__',
    '__destroyById__',
    '__updateById__',
    '__upsert__',
    '__exists__',
    '__link__',
    '__get__',
    '__create__',
    '__update__',
    '__destroy__',
    '__unlink__',
    '__count__',
    '__delete__'
  ];

  if (Model && Model.sharedClass) {

    var methodsToExpose = options.expose || [];
    var relationMethods = [];
    var relations = Model.definition.settings.relations || {};

    Object.keys(relations).forEach(function(relation) {
      for(var relationMethod of defaultRelationMethods){
        relationMethods.push({
          name: relationMethod+relation,
          isStatic: false
        });
      }
    });

    //console.log(Model.modelName,_.map(Model.sharedClass.methods(),function(value){return _.pick(value,['name','isStatic']);}));

    defaultMethods.concat(relationMethods).forEach(function(method) {
      if (
        methodsToExpose.indexOf(method) < 0
      ) {
        var name = method.name;
        if(!method.isStatic){
          name = `prototype.${name}`;
        }
        Model.disableRemoteMethodByName(name);
        //console.log(Model.modelName,`Model.disableRemoteMethodByName(${method.name},${method.isStatic})`);
      }
    });
  }
};
