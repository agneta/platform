const yaml = require('js-yaml');
const fs = require('fs-extra');
const _ = require('lodash');
const File = require('./file');
const replaceExt = require('replace-ext');
const path = require('path');

module.exports = function(locals) {
  var project = locals.project;
  var pagePaths = {};

  return function(options) {
    var item = options.item;
    var dir = options.dir;
    var filePath = path.relative(dir, item.path);
    var pathParsed = path.parse(filePath);
    var path_url = filePath;

    if (pathParsed.base === 'index.yml') {
      path_url = path.join(filePath, '..');
    } else {
      path_url = path.join(pathParsed.dir, pathParsed.name);
    }
    path_url = path_url.split(path.sep).join('/');

    if (pageExists(path_url)) {
      return;
    }
    return project.site.pages
      .count({
        source: filePath,
        mtime: item.mtime
      })
      .then(function(count) {
        if (count) {
          //console.log('cached!');
          return;
        }
        //console.log('File changed!', filePath, item.mtime);

        var file = new File({
          source: item.path,
          path: filePath,
          type: 'create',
          params: {
            path: path_url
          }
        });

        var data;

        return readFile(file)
          .then(function(_data) {
            data = _data;
            data.mtime = item.mtime;
            data.path = data.path || path_url;
            data.name = path.parse(data.path).name;
            //---------------------------------------
            // extend

            if (data.extend) {
              var extendPath =
                path.join(project.paths.app.source, data.extend) + '.yml';
              return fs.readFile(extendPath).then(function(content) {
                var extendedData = yaml.safeLoad(content) || {};
                _.mergePages(extendedData, data);
                data = extendedData;
              });
            }
          })
          .then(function() {
            //---------------------------------------
            // Dialogs

            if (data.path.indexOf('dialog/') === 0) {
              data.viewOnly = true;
              data.isDialog = true;
            }

            if (data.path.indexOf('partial/') === 0) {
              data.viewOnly = true;
              data.isPartial = true;
            }

            //---------------------------------------
            // Search for template if not defined

            if (!data.template) {
              var templatePath = path.join(
                'source',
                replaceExt(data.path, '.ejs')
              );

              templatePath = project.theme.getFile(templatePath);

              if (templatePath) {
                templatePath = path.parse(data.path);
                templatePath = path.join(templatePath.dir, templatePath.name);
                data.template = templatePath;
              }
            }

            data.isSource = true;

            if (project.config.authorization && !data.skipAuthorization) {
              if (!data.authorization) {
                data.authorization = project.config.authorization;
              }
            }

            //---------------------------------------

            var pagePath = locals.page.parseFilename(data.path);
            pagePaths[pagePath] = true;
            //console.log(data.path);

            return locals.page.process(data);
          });
      });

    function pageExists(dataPath) {
      var pagePath = locals.page.parseFilename(dataPath);
      return pagePaths[pagePath] ? true : false;
    }

    function readFile(file) {
      return file.read().then(function(content) {
        var data;
        try {
          data = yaml.safeLoad(content);
        } catch (error) {
          console.error(
            'Found problem on YAML: ' + file.path + '. ' + error.message
          );
          data = {
            template: 'error/format',
            hasError: true,
            data: error
          };
        }

        if (!data) {
          data = {};
        }

        data.source = file.path;
        data.filename = path.parse(data.source).name;

        return data;
      });
    }
  };
};
