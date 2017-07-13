module.exports = function(app) {

    var client = app.get('options').client;
    var project = client.project;

    return function(data) {

        project.site.lang = data.lang;
        var content = client.renderData(data.page);
        if (content) {
            data.res.send(content);
        }
    };

};
