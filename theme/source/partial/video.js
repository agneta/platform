/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/partial/video.js
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
(function() {

  var app = window.angular.module('MainApp');

  app.page('VideoCtrl', function(data) {

    var vm = this;

    var sources = [];
    for (var i in data.sources) {
      var source = data.sources[i];
      sources.push({
        src: agneta.get_media(source.src),
        type: source.type
      });
    }

    vm.config = {
      sources: sources,
      theme: agneta.get_lib('videogular.min.css')
    };
  });

})();
