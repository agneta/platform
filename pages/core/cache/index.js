module.exports = function(locals) {

    locals.cache = {};

    require('./data')(locals);
    require('./templates')(locals);
};
