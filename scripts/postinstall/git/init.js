/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: scripts/postinstall/git/init.js
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


module.exports = function(app) {

  return app.git.init()
    .then(function(result) {
      if (result.initiated) {
        return app.git.update();
      }
    })
    .then(function() {

      console.log('Git repository is ready');
      console.log('Current branch is', app.git.branch.current);

    });


};
