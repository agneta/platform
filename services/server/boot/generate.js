var generator = require('loopback-sdk-angular');
var path = require('path');
var fs = require('fs-extra');

module.exports = function(app) {

    var options = app.get('options');
    var project = options.client.project;

    app.generate = {
        methods: function(options) {

            var script = generator.services(app, {});
            var token = app.get('token');

            options = options || {};

            var outputDir = options.outputDir || project.paths.generated;

            script = script.replace('$LoopBack$', `$${token.name}$`);

            var target = options.filename || 'services.js';
            var outputPath = path.join(outputDir, target);

            return fs.outputFile(outputPath, script)
                .then(function() {
                    console.log('Exported service:', outputPath);
                });

        }
    };

};
