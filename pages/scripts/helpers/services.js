module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('services_config', function(name) {
        return locals.services.get(name);
    });
};
