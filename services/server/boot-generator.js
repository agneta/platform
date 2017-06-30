module.exports = function(app, config) {

    var searchModels = require('./boot/search/models')(app);

    for (var item of searchModels) {

        var name = item.model.name;
        var fileName = name.toLowerCase() + '.json';

        //console.log(fileName,item.model);
        //console.log('----------------------------------');

        config._definitions[fileName] = {
          definition: item.model
        };

        config.models[name] = item.config;

    }


    return config;
};
