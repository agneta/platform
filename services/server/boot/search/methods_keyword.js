module.exports = function(Model, app,models) {

    app.helpers.runRemote({
        model: Model
    });


    Model.get = function(lang) {
        return Model.find({
            fields: {
                id: true,
                value: true
            },
            where: {
                lang: lang
            }
        });
    };


    //---------------------------------------------------------

    Model.clear = function() {
        return app.helpers.dropCollection([
                models.keyword.definition.name,
                //models.source.definition.name,
                models.position.definition.name,
                models.field.definition.name
            ])
            .then(function() {
                return {
                    success: 'Deleted Keywords, Positions, and Fields'
                };
            });
    };
};
