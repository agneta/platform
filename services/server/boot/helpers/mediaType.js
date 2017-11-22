/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/helpers/mediaType.js
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
module.exports = function(mimeType) {

  if (!mimeType) {
    return;
  }

  var typeParsed = mimeType.split('/');
  var mimetype = typeParsed[0];
  var mediatype = typeParsed[1];

  var type = mimetype;

  switch (mimetype) {
    case 'image':
      switch (mediatype) {
        case 'jpeg':
        case 'png':
          type = 'image';
          break;
        case 'svg+xml':
          type = 'icon';
          break;
        default:

      }
      break;
    case 'application':
      switch (mediatype) {
        case 'pdf':
          type = 'pdf';
          break;
      }
      break;
    default:

  }

  return type;
};
