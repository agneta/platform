/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/config.js
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
  token: {
    name: 'access_app'
  },
  account:{
    callbacks: []
  },
  restApiRoot: '/api',
  host: 'locahost',
  domain: 'locahost',
  email:{
    provider: 'nodemailer'
  },
  roles: {
    administrator: {
      model: 'Role_Administrator',
      title:{
        en: 'System Administrator',
        gr: 'Διαχειριστής Συστημάτων'
      }
    },
    account_manager: {
      model: 'Role_Account_Manager',
      title:{
        en: 'Account Manager',
        gr: 'Διαχειριστής Λογαριασμών'
      }
    },
    team_member: {
      model: 'Role_Team_Member',
      title:{
        en: 'Team Member',
        gr: 'Μέλος της ομάδας'
      }
    },
    reviewer: {
      model: 'Role_Reviewer',
      title:{
        en: 'Reviewer',
        gr: 'Αναθεωρητής'
      }
    },
    editor: {
      model: 'Role_Editor',
      title:{
        en: 'Editor',
        gr: 'Συντάκτης'
      }
    }
  },
  limiter: {
    global: {
      freeRetries: 100,
      attachResetToRequest: false,
      refreshTimeoutOnRequest: false,
      minWait: 10 * 60 * 1000,
      maxWait: 1 * 60 * 60 * 1000,
      lifetime: 10 * 60,
    }
  },
  search: {
    page: {
      model: 'Page'
    },
    media: {
      model: 'Media'
    },
    mediaPrivate: {
      model: 'Media_Private'
    }
  },
  remoting: {
    rest: {
      normalizeHttpPath: false,
      xml: false
    },
    json: {
      strict: false,
      limit: '100kb'
    },
    urlencoded: {
      extended: true,
      limit: '100kb'
    }
  },
  activity: {
    auth: {
      allow: {
        view_page: ['reviewer'],
        session: ['reviewer'],
        view_browser: ['reviewer'],
        view_browser_version: ['reviewer'],
        view_os: ['reviewer'],
        view_os_version: ['reviewer'],
        view_vendor: ['reviewer'],
        view_device: ['reviewer'],
        view_vendor_model: ['reviewer'],
        engagement: ['reviewer'],
        search_keyword: ['reviewer'],
        search_page: ['reviewer']
      }
    }
  },
  git: {
    remote: {}
  },
  language: require('./config/language'),
  media: require('./config/media'),
  activities: require('./config/activities'),
  legacyExplorer: false
};
