/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/ui/gallery.js
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
/*global Swiper*/
/*global Blazy*/

var app = window.angular.module('MainApp');

app.service('UiGallery', function($timeout) {
  var self = this;

  this.photoswipe = require('ui/gallery/photoswipe.module');

  this.init = swiper;

  this.album = function(options) {
    options = options || {};

    $timeout(function() {
      if (options.blazy) {
        blazy();
      }
      self.photoswipe(options);
    }, 400);
  };

  function blazy() {
    new Blazy({
      container: '#view-scroller',
      src: 'blazy-src',
      breakpoints: [
        {
          width: 420, // Max-width
          src: 'data-src-small'
        }
      ],
      error: function(ele, msg) {
        console.log('error', msg);

        if (msg === 'missing') {
          // Data-src is missing
        } else if (msg === 'invalid') {
          // Data-src is invalid
        }
      }
    });
  }

  function swiper(options) {
    options = options || {};

    var swiperContainer = options.swiperContainer || '.swiper-container';

    var swiperOptions = angular.extend(
      {
        // If loop true set photoswipe - counterEl: false
        //loop: true,
        /* slidesPerView || auto - if you want to set width by css like flickity.js layout - in this case width:80% by CSS */
        slidesPerView: 'auto',
        spaceBetween: 7,
        centeredSlides: true,
        speed: 800,
        autoplay: {
          delay: 4000
        },
        // If we need pagination
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          renderBullet: function(index, className) {
            return '<span class="' + className + '"></span>';
          }
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }
      },
      options
    );

    var swiper = new Swiper(swiperContainer, swiperOptions);
    // execute above function
    self.photoswipe({
      selector: '.my-gallery',
      swiper: swiper
    });
  }
});
