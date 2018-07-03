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

const _ = require('lodash');
const paths = require('./paths');
const config = require('./config');
import * as Promise from 'bluebird';
import { Application } from 'express';

interface OptionsServer {
  id?: string;
  paths?: object;
  mode?: string;
  dir?: string;
  sync?: boolean;
  locals?: Locals;
}
interface Source {
  name: string;
  path: string;
}
interface Locals {
  id?: string;
  includeSources: Array<Source>;
  app: Application;
}
export interface Component {
  locals: Locals;
  start(): void;
  preInit(): void;
  init(): void;
  preInit(): void;
}

_.mixin(require('lodash-deep'));
_.omitDeep = function(collection: Array<any>, excludeKeys: Array<string>) {
  function omitFn(value: any) {
    if (value && typeof value === 'object') {
      excludeKeys.forEach(key => {
        delete value[key];
      });
    }
  }

  return _.cloneDeepWith(collection, omitFn);
};

export function init(subApps: Array<Component>) {
  return Promise.each(subApps, function(component: Component) {
    if (component.preInit) {
      return component.preInit();
    }
  })
    .then(function() {
      return Promise.each(subApps, function(component: Component) {
        console.log('Initiating: ' + component.locals.app.get('name'));

        if (component.init) {
          return component.init();
        }
      });
    })
    .then(function() {
      return Promise.each(subApps, function(component: Component) {
        console.log('Starting: ' + component.locals.app.get('name'));
        if (component.start) {
          return component.start();
        }
        return null;
      });
    });
}

export function normal(options: OptionsServer) {
  var component = pages(
    _.extend(
      {
        mode: 'default'
      },
      options
    )
  );

  return component;
}
export function portal(options: Locals) {
  options.includeSources = [
    {
      name: 'portal',
      path: paths.appPortal.source
    }
  ];

  var component = pages({
    mode: 'preview',
    dir: paths.portal.base,
    locals: options
  });

  setName(component, 'pages_portal', options);
  return component;
}
export function website(options: Locals) {
  var component = pages({
    mode: 'preview',
    sync: true,
    locals: options
  });

  setName(component, 'pages_website', options);
  return component;
}
export function pages(options: OptionsServer) {
  options.paths = paths.loadApp(options);
  return getComponent('pages', '../pages', options);
}
export function services(options: OptionsServer) {
  options.paths = paths.loadApp(options);
  return getComponent('services', paths.core.services, options);
}
export function storage(options: OptionsServer) {
  return getComponent('storage', './server/storage', options);
}

function getComponent(
  name: string,
  componentPath: string,
  options: OptionsServer
): Component {
  _.extend(options, config);

  var component = require(componentPath)(options);

  setName(component, name, options);

  return component;
}

function setName(
  component: Component,
  name: string,
  options: Locals | OptionsServer
) {
  options = options || {};
  if (options.id) {
    name += '_' + options.id;
  }
  component.locals.app.set('name', name);
}
