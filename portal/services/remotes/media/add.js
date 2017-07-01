module.exports = function(Model) {

    Model.add = function(data) {

        var attributes = {
            location: data.location.value,
            location_keywords: Model._getKeywords(data.location.positions),
        };

        var fields = [].concat(data.location);

        return Model._add({
            where: {
                location: data.location.value
            },
            include: {
                location: true,
                name: true,
                isSize: true,
                createdAt: true,
                type: true
            },
            findOnly: true,
            fields: fields,
            attributes: attributes
        });

    };
};
