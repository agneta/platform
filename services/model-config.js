/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/model-config.js
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

module.exports = function() {

  var sources = [
    'loopback/common/models',
    'loopback/server/models'
  ];

  return {
    _meta: {
      sources: sources,
      mixins: [
        'loopback/common/mixins',
        'loopback/server/mixins',
        '../node_modules/loopback-ds-timestamp-mixin',
        '../../loopback-ds-timestamp-mixin',
        'common/mixins',
        './mixins'
      ]
    },
    User: {
      dataSource: 'db',
      public: false
    },
    Role_Administrator: {
      dataSource: 'db',
      public: true
    },
    Role_Reviewer: {
      dataSource: 'db',
      public: false
    },
    Role_Editor: {
      dataSource: 'db',
      public: true
    },
    AccessToken: {
      dataSource: 'db',
      public: false
    },
    ACL: {
      dataSource: 'db',
      public: false
    },
    RoleMapping: {
      dataSource: 'db',
      public: false
    },
    Role: {
      dataSource: 'db',
      public: false
    },
    //-----------------------------------------
    // Account
    AccountRole: {
      dataSource: 'db',
      public: false
    },
    Account: {
      dataSource: 'db',
      public: true,
      options: {
        emailVerificationRequired: true
      }
    },
    Account_SSH: {
      dataSource: 'db',
      public: false
    },
    Account_Cert: {
      dataSource: 'db',
      public: false
    },
    Account_IP: {
      dataSource: 'db',
      public: false
    },
    //-----------------------------------------
    // Activity
    Activity_Item: {
      dataSource: 'db',
      public: true
    },
    Activity_Feed: {
      dataSource: 'db',
      public: true
    },
    Activity_Count: {
      dataSource: 'db',
      public: true
    },
    //-----------------------------------------
    Form: {
      dataSource: 'db',
      public: true
    },
    Search_Page: {
      dataSource: 'db',
      public: true
    },
    Process: {
      dataSource: 'db',
      public: true
    },
    Process_Server: {
      dataSource: 'db',
      public: false
    },
    Session: {
      dataSource: 'db',
      public: false
    },
    Page: {
      dataSource: 'db',
      public: false
    },
    Attachment: {
      dataSource: 'db',
      public: false
    },
    Media: {
      dataSource: 'db',
      public: false
    },
    Media_Private: {
      dataSource: 'db',
      public: false
    }
  };

};
