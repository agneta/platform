require('sharp');

switch (process.env.MODE) {
    case 'services':
        require('./server/services');
        break;
    default:
        require('./server/portal');
        break;
}
