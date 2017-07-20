/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/_pages/field-state.js
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

  var focused = null;
  $scope.fieldFocus = function(data) {
    if (focused) {
      delete focused.__focused;
    }
    data.__focused = true;
    focused = data;
  };

  var hovered = null;
  $scope.fieldHover = function(data) {
    if (hovered) {
      delete hovered.__hovered;
    }
    data.__hovered = true;
    hovered = data;
  };

  $scope.clearHiddenData = function() {

    if (hovered) {
      delete hovered.__hovered;
    }
    if (focused) {
      delete focused.__focused;
    }
  };

})();
