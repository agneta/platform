var path = require('path');
var config = require('./config');
var appName = process.env.APP_NAME || 'website';

//console.log('Application folder:', appName);

module.exports = {
    get: get,
    project: get()
};

function get(options) {

    var paths = {};

    paths.project = process.cwd();

    var projectModules = path.join(paths.project, 'node_modules', 'agneta-platform');

    paths.services = path.join(projectModules, 'services');
    paths.portal = path.join(projectModules, 'portal');
    paths.framework = path.join(projectModules, 'pages');
    paths.baseTheme = path.join(projectModules, 'theme');

    paths.api = path.join(paths.project, 'services');
    paths.portalWebsite = path.join(paths.portal, 'website');
    paths.portalSource = path.join(paths.portalWebsite, 'source');
    paths.portalAssets = path.join(paths.portalSource, 'assets');
    paths.portalProject = path.join(paths.project, 'portal');
    paths.portalGenerated = path.join(paths.portalProject, 'generated');
    paths.models = path.join(paths.api, 'models');

    //////////////////////////////////////////////////////////////////////////

    paths.base = (options && options.dir) || path.join(paths.project, appName);

    paths.scriptsFramework = path.join(paths.framework, 'scripts');

    paths.dataTheme = path.join(paths.baseTheme, 'data');
    paths.templatesTheme = path.join(paths.baseTheme, 'templates');
    paths.scriptsTheme = path.join(paths.baseTheme, 'scripts');
    paths.sourceTheme = path.join(paths.baseTheme, 'source');
    paths.assetsTheme = path.join(paths.sourceTheme, 'assets');
    paths.pagesTheme = path.join(paths.sourceTheme, 'pages');
    paths.configTheme = path.join(paths.baseTheme, 'config.yml');

    paths.config = path.join(paths.base, 'config.yml');
    paths.data = path.join(paths.base, 'data');
    paths.lib = path.join(paths.base, 'lib');
    paths.build = path.join(paths.base, 'build');
    paths.template = path.join(paths.base, 'templates');
    paths.source = path.join(paths.base, 'source');
    paths.pages = path.join(paths.source, 'pages');
    paths.assets = path.join(paths.source, 'assets');
    paths.generated = path.join(paths.source, 'generated');
    paths.tmp = path.join(paths.base, 'tmp');
    paths.scripts = path.join(paths.base, 'scripts');

    return paths;
};
