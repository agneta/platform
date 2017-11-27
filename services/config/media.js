/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/config/media.js
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
  sizes: {
    square: {
      label: 'Square',
      width: 75,
      height: 75,
      crop: true
    },
    square_medium: {
      label: 'Medium Square',
      width: 150,
      height: 150,
      crop: true
    },
    square_large: {
      label: 'Large Square',
      width: 300,
      height: 300,
      crop: true
    },
    thumbnail: {
      label: 'Thumbnail',
      width: 100,
      height: 75
    },
    small: {
      label: 'Small',
      width: 240,
      height: 180
    },
    small_320: {
      label: 'Small 320',
      width: 320,
      height: 240
    },
    medium: {
      label: 'Medium',
      width: 500,
      height: 375
    },
    medium_640: {
      label: 'Medium 640',
      width: 640,
      height: 480
    },
    medium_800: {
      label: 'Medium 800',
      width: 800,
      height: 600
    },
    large: {
      label: 'Large',
      width: 1024,
      height: 768
    },
    extra_large: {
      label: 'Extra Large',
      width: 1500,
      height: 1153
    },
    original: {
      label: 'Original',
      width: 2400,
      height: 1800
    }
  }
};
