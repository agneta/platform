const _ = require('lodash');

module.exports = function(Model, app) {
  Model.observe('loaded', function(ctx) {
    var data = ctx.data;

    return Promise.resolve()
      .then(function() {
        if (!data) {
          return;
        }

        if (ctx.options.updatedPicture) {
          return;
        }

        if (!data.id) {
          return;
        }

        if (!data.password) {
          return;
        }

        if (!data.email) {
          return;
        }

        var picture = (data.picture = {});
        picture.icon = data.icon || 'default';

        var findOptions = {
          where: {
            location: app.helpers.normalizePath(
              Model.__mediaLocation({
                accountId: data.id + '',
                path: 'profile'
              })
            )
          },
          fields: {
            id: true,
            location: true
          }
        };
        //console.log(findOptions);
        return Model.getModel('Media_Private')
          .findOne(findOptions)
          .then(function(file) {
            if (file) {
              picture.media = file.location;
            }
            return Model.replaceById(
              data.id,
              _.extend(
                {
                  picture: picture
                },
                data
              ),
              {
                updatedPicture: true
              }
            );
          });
      })
      .then(function(result) {
        return result || data;
      });
  });
};
