/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: test/api/edit_page/new.js
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

module.exports = function(options) {

  describe('Account', function() {

    var account = options.account.default.test;

    it('should login', function() {
      return options.agent
        .post('/api/Accounts/sign-in')
        .send({
          email: account.email,
          password: account.password
        })
        .then(function(res) {
          res.should.have.cookie('access_portal');
        });
    });

  });

  describe('Portal Editor', function() {

    var pagePath = '/_test/new-file';

    it('should create a new page', function() {
      return options.agent
        .post('/api/Edit_Pages/new')
        .send({
          language: 'en',
          path: pagePath,
          template: 'content',
          title: 'New test page'
        })
        .then(function(res) {
          res.should.have.status(200);
        });
    });

    it('should remove a page', function() {
      return options.agent
        .post('/api/Edit_Pages/delete')
        .send({
          language: 'en',
          id: pagePath
        })
        .then(function(res) {
          res.should.have.status(200);
        });
    });

  });

};
