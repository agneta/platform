//
// Find or create the main administrator

module.exports = function(app) {

    var admin = app.get('admin');
    if (admin) {
        var Administrator = app.models.Role_Administrator;
        return Administrator.new(admin);
    }

};
