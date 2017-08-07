/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/search-engine.js
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

/*global Fuse:true*/
/*global S:true*/
/*global greeklish:true*/

function _e_searchEngine(app) {

  app.service('Search_Engine', function($http, $location, $timeout) {

    this.init = function(options) {

      var Model = options.model;
      var $scope = options.scope;
      var keywords;
      var fuse;

      $http.get(options.keywords)
        .then(function(response) {

          if (!response) {
            console.error('Did not get search keywords');
            return;
          }

          keywords = response.data;
          if (!keywords.length) {
            return;
          }

          fuse = new Fuse(keywords, {
            include: ['score'],
            shouldSort: true,
            keys: [
              'value'
            ]
          });

          $scope.initialized = true;

        });

      //------------------------------

      var attached = [];

      $scope.attach = function(scope) {
        attached.push(scope);
        scope.selectItem = $scope.selectItem;
        scope.querySearch = $scope.querySearch;
        scope.searchKeywords = $scope.searchKeywords;
      };

      function setValue(name, value) {
        for (var index in attached) {
          var scope = attached[index];
          scope[name] = value;
        }
        $scope[name] = value;
      }

      $scope.selectItem = function(item) {
        if (!item) {
          return;
        }
        $location.path(agneta.url(item.path));
      };

      $scope.searchClear = function() {
        setValue('searchQuery', null);
        setValue('searchResults', null);
        setValue('searchText', null);
      };

      $scope.querySearch = function(originalQuery) {

        /////////////////////////////////

        var query = S(originalQuery)
          .humanize()
          .latinise()
          .s;

        if (window.greeklish) {
          query = greeklish(query);
        }

        query = query.replace(/[^a-zA-Zα-ωΑ-Ω0-9]/g, ' ');

        query = S(query)
          .collapseWhitespace()
          .trim()
          .s;

        /////////////////////

        var foundKeywords = [];
        var words = query.split(' ');

        for (var index in words) {

          var word = words[index];
          var result = fuse.search(word)[0];

          if (!result) {
            continue;
          }

          foundKeywords.push(keywords[result.item]);

        }

        if (!foundKeywords.length) {
          return Promise.resolve({
            notfound: 'Could not find a keyword'
          });
        }

        ////////////////////

        return Model.search({
          text: originalQuery,
          keywords: foundKeywords
        })
          .$promise
          .then(function(result) {
            if (options.onResult) {
              options.onResult(result);
            }
            //console.log(result);
            return result.items || [];
          });

      };

      //-------------------------------------------------

      var query;
      var waiting;

      $scope.searchKeywords = function(_query) {

        query = _query;

        if (!_query) {
          $scope.searchClear();
          return;
        }

        if (waiting) {
          return;
        }

        waiting = true;

        $timeout(function() {

          setValue('searchQuery', query);

          $scope.querySearch(query)
            .then(function(results) {
              //console.log(results);
              $timeout(function() {
                setValue('searchResults', results.length ? results : null);
                setValue('isSearching', false);
              }, 10);
            });

          waiting = false;
          setValue('isSearching', true);
        }, 1000);
      };

    };
  });

}
