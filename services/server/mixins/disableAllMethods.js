/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/mixins/disableAllMethods.js
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
  if(Model && Model.sharedClass) {
    var methodsToExpose = options.expose || [];
    var methods = Model.sharedClass.methods();
    var relationMethods = [];
    var hiddenMethods = [];

    try {
      Object.keys(Model.definition.settings.relations).forEach(function(relation) {
        relationMethods.push({ name: '__findById__' + relation, isStatic: false });
        relationMethods.push({ name: '__destroyById__' + relation, isStatic: false });
        relationMethods.push({ name: '__updateById__' + relation, isStatic: false });
        relationMethods.push({ name: '__upsert__' + relation, isStatic: false });
        relationMethods.push({ name: '__exists__' + relation, isStatic: false });
        relationMethods.push({ name: '__link__' + relation, isStatic: false });
        relationMethods.push({ name: '__get__' + relation, isStatic: false });
        relationMethods.push({ name: '__create__' + relation, isStatic: false });
        relationMethods.push({ name: '__update__' + relation, isStatic: false });
        relationMethods.push({ name: '__destroy__' + relation, isStatic: false });
        relationMethods.push({ name: '__unlink__' + relation, isStatic: false });
        relationMethods.push({ name: '__count__' + relation, isStatic: false });
        relationMethods.push({ name: '__delete__' + relation, isStatic: false });
      });
    } catch(err) {
      console.log(err);
    }
    methods.concat(relationMethods).forEach(function(method) {
      var methodName = method.name;
      if(methodsToExpose.indexOf(methodName) < 0) {
        hiddenMethods.push(methodName);
        Model.disableRemoteMethodByName(methodName, method.isStatic);
      }
    });
    // if(hiddenMethods.length > 0) {
    //     console.log('\nRemote mehtods hidden for', modelName, ':', hiddenMethods.join(', '), '\n');
    // }
  }
};
