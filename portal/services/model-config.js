/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/model-config.js
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
module.exports = {
    Media: {
        dataSource: 'db',
        public: true
    },
    Media_Private: {
        dataSource: 'db',
        public: true
    },
    App_Page: {
        dataSource: 'db',
        public: true
    },
    Email_Template: {
        dataSource: false,
        public: true
    },
    Edit_Page: {
        dataSource: false,
        public: true
    },
    Edit_Data: {
        dataSource: false,
        public: true
    },
    Utility: {
        dataSource: false,
        public: true
    },
    GIT: {
        dataSource: false,
        public: true
    },
    Application: {
        dataSource: false,
        public: true
    }
};
