(function() {

    var app = window.angular.module('MainApp');
    var tokenName = "<%-configServices('token').name%>";

    function getName(name) {
        return tokenName + '::' + name;
    }

    app.config(function(LoopBackResourceProvider) {
        LoopBackResourceProvider.setAuthHeader(tokenName);
        var url = agneta.urljoin(agneta.url_services, 'api');
        LoopBackResourceProvider.setUrlBase(url);

    });

    <%-js('main/account/login')%>
    <%-js('main/account/password')%>
    <%-js('main/account/popup')%>
    <%-js('main/account/recovery')%>
    <%-js('main/account/root')%>
    <%-js('main/account/verification')%>

})();
