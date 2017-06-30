(function() {
    var parser = new UAParser();
    var browser = parser.getBrowser();

    var minVersion;

    switch (browser.name) {
        case 'Chromium':
            minVersion = 21;
            break;
        case 'Chrome':
            minVersion = 21;
            break;
        case 'Firefox':
            minVersion = 28;
            break;
        case 'Opera':
            minVersion = 12;
            break;
        case 'IE':
            minVersion = 11;
            break;
        case 'Edge':
            minVersion = 12;
            break;
        case 'Safari':
            minVersion = 6;
            break;
        case 'Mobile Safari':
            minVersion = 6;
            break;
        case 'Android Browser':
            minVersion = 2;
            break;
    }

    window.isCompatible = function() {

        if (minVersion) {

            var browserVersion = browser.version.split('.');
            while (browserVersion.length > 2) {
                browserVersion.pop();
            }
            browserVersion = browserVersion.join('.');
            browserVersion = parseFloat(browserVersion);
            if (browserVersion < minVersion) {
                return false;
            }

        }

        return true;

    };

})();
