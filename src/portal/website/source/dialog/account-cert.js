/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/account-cert.js
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

  agneta.directive('AgAccountAddCert', function(data, Upload, $mdDialog, $rootScope) {

    var vm = this;
    var object;

    agneta.extend(vm,'AgDialogCtrl', {
      data: data
    });

    vm.formCertFields = data.fields;

    vm.uploadPFX = function(_object) {

      object = _object;

    };

    vm.update = function(){

      data.onSubmit(
        makeCall('cert-update')
      );

    };

    vm.submit = function(){

      data.onSubmit(
        makeCall('cert-add')
      );

    };

    function makeCall(method) {
      var modelName = $rootScope.portal.getMethod('account');

      var uploadData = {
        object: object,
        accountId: data.accountId
      };

      angular.extend(uploadData,vm.formCertFields);

      console.log(uploadData);

      return Upload.upload({
        url: agneta.url_api(modelName+'/'+method),
        method: 'POST',
        arrayKey: '',
        data: uploadData
      })
        .then(function() {
          vm.close();
        });
    }

  });

})();
