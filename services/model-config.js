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

const path = require('path');
module.exports = function() {
  var sources = ['loopback/common/models', 'loopback/server/models'];

  return {
    _meta: {
      sources: sources,
      mixins: [
        'loopback/common/mixins',
        'loopback/server/mixins',
        path.join(require.resolve('loopback-ds-timestamp-mixin'), '..'),
        'common/mixins',
        './mixins'
      ]
    },
    Role_Administrator: {
      dataSource: 'db',
      public: true
    },
    Role_Account_Manager: {
      dataSource: 'db',
      public: true
    },
    Role_Team_Member: {
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
    AccountToken: {
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
    System: {
      dataSource: false,
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
    Directory: {
      dataSource: 'db',
      public: true
    },
    Page: {
      dataSource: 'db',
      public: true
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
