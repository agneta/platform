"use strict";
/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/start.js
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
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('lodash');
var paths = require('./paths');
var config = require('./config');
var Promise = require("bluebird");
_.mixin(require('lodash-deep'));
_.omitDeep = function (collection, excludeKeys) {
    function omitFn(value) {
        if (value && typeof value === 'object') {
            excludeKeys.forEach(function (key) {
                delete value[key];
            });
        }
    }
    return _.cloneDeepWith(collection, omitFn);
};
var start = {
    init: function (subApps) {
        return Promise.each(subApps, function (component) {
            if (component.preInit) {
                return component.preInit();
            }
        })
            .then(function () {
            return Promise.each(subApps, function (component) {
                console.log('Initiating: ' + component.locals.app.get('name'));
                if (component.init) {
                    return component.init();
                }
            });
        })
            .then(function () {
            return Promise.each(subApps, function (component) {
                console.log('Starting: ' + component.locals.app.get('name'));
                if (component.start) {
                    return component.start();
                }
                return null;
            });
        });
    },
    default: function (options) {
        var component = start.pages(_.extend({
            mode: 'default'
        }, options));
        return component;
    },
    portal: function (options) {
        options.includeSources = [
            {
                name: 'portal',
                path: paths.appPortal.source
            }
        ];
        var component = start.pages({
            mode: 'preview',
            dir: paths.portal.base,
            locals: options
        });
        setName(component, 'pages_portal', options);
        return component;
    },
    website: function (options) {
        var component = start.pages({
            mode: 'preview',
            sync: true,
            locals: options
        });
        setName(component, 'pages_website', options);
        return component;
    },
    pages: function (options) {
        options.paths = paths.loadApp(options);
        return getComponent('pages', '../pages', options);
    },
    services: function (options) {
        options.paths = paths.loadApp(options);
        return getComponent('services', paths.core.services, options);
    },
    storage: function (options) {
        return getComponent('storage', './server/storage', options);
    }
};
function getComponent(name, componentPath, options) {
    _.extend(options, config);
    var component = require(componentPath)(options);
    setName(component, name, options);
    return component;
}
function setName(component, name, options) {
    options = options || {};
    if (options.id) {
        name += '_' + options.id;
    }
    component.locals.app.set('name', name);
}
module.exports = start;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztHQWVHOztBQUVILElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLGtDQUFvQztBQTRCcEMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUMsUUFBUSxHQUFHLFVBQVMsVUFBc0IsRUFBRSxXQUEwQjtJQUN0RSxnQkFBZ0IsS0FBVTtRQUN4QixJQUFJLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDdEMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7Z0JBQ3JCLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUM7QUFFRixJQUFJLEtBQUssR0FBRztJQUNWLElBQUksRUFBRSxVQUFTLE9BQXlCO1FBQ3RDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBUyxTQUFvQjtZQUN4RCxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JCLE9BQU8sU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzVCO1FBQ0gsQ0FBQyxDQUFDO2FBQ0MsSUFBSSxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLFNBQW9CO2dCQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLGNB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