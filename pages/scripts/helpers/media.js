const path = require('path');
const url = require('url');
const _ = require('lodash');
const urljoin = require('url-join');
const request = require('request-promise');
const chalk = require('chalk');
const LRU = require("lru-cache");

const cache = LRU({
    maxAge: 3 * 60 * 1000,
});

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('prv_media', function() {
        return media.call(
            this,
            project.site.services.url,
            project.config.media.base,
            urljoin.apply(this, arguments)
        );
    });

    project.extend.helper.register('get_media', function() {
        return media.call(
            this,
            project.site.servers.media,
            urljoin.apply(this, arguments)
        );
    });

    function media(host, pathMedia) {

        pathMedia = urljoin(host, pathMedia);

        if (!cache.get(pathMedia)) {

            cache.set(pathMedia, true);

            request({
                    method: 'HEAD',
                    uri: pathMedia
                })
                .catch(function(err) {
                    console.log(chalk.bgRed('MEDIA_ERROR ' + err.statusCode), pathMedia);
                });

        }

        return this.getVersion(pathMedia);

    }

    project.extend.helper.register('page_media', function(path, page) {
        page = page || this.page;
        return this.get_media(
            urljoin(
                this.pagePath(page), path
            )
        );
    });

    project.extend.helper.register('get_icon', function(name) {
        return this.get_media(urljoin('icons', name));
    });

    project.extend.helper.register('get_cover', function(page) {

        page = page || this.page;

        if (!page.$cover) {
            return;
        }

        var name = 'cover';

        if (_.isString(page.$cover)) {
            name = page.$cover;
        }

        var coverPath = urljoin(this.pagePath(page), name);
        return this.get_media(coverPath);

    });
};
