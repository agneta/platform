module.exports = function(Model, app) {

    var tokenName = app.get('token').name;

    require("../mixins/disableAllMethods")(Model);

    //---------------------------------------------------

    Model.observe('loaded', function(ctx) {
        var instance = ctx.instance || ctx.data;

        if (!instance.picture && !instance.avatar) {
            instance.avatar = 'default';
        }

        return Promise.resolve();
    });

    Model.validatesLengthOf('password', {
        min: 7,
        message: {
            min: 'too weak'
        }
    });

    Model.removeLoginCookie = function(context, accessToken, next) {
        var res = context.res;
        var req = context.req;
        res.clearCookie(tokenName, {
            signed: req.signedCookies ? true : false
        });
        return next();
    };

    //---------------------------------------------------
    // Remove short term token as it should be used only once

    Model.afterRemote('**', function(ctx, account, next) {

        var accessToken = ctx.req.accessToken;
        if (accessToken && accessToken.ttl < 1000) {
            console.log(accessToken);
            app.models.AccessToken.destroyById(accessToken.id,next);

        } else {
            next();
        }
    });

    //---------------------------------------------------

    require("./account/includeRoles")(Model,app);
    require("./account/hasRoles")(Model,app);
    require("./account/activities")(Model,app);
    require("./account/activity")(Model,app);
    require("./account/passwordChange")(Model,app);
    require("./account/deactivate")(Model,app);
    require("./account/me")(Model,app);
    require("./account/recover")(Model,app);
    require("./account/register")(Model,app);
    require("./account/requestPassword")(Model,app);
    require("./account/requestRecovery")(Model,app);
    require("./account/resendVerification")(Model,app);
    require("./account/sendVerification")(Model,app);
    require("./account/signedIn")(Model,app);
    require("./account/signIn")(Model,app);
    require("./account/signOut")(Model,app);
    require("./account/signOutAll")(Model,app);
    require("./account/roleAdd")(Model,app);
    require("./account/verifyEmail")(Model,app);



};
