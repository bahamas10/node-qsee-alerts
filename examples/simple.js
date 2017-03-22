/**
 * This will listen on smtp://0.0.0.0:10465 for incoming email messages
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: March 11, 2017
 * License: MIT
 */

var opts = {
    host: '0.0.0.0',
    port: 10465,
    username: 'foo@test.com',
    password: 'bar'
};

var qsee = new QSeeAlertsServer(opts);

// emitted when the server is listening and ready for new connections
qsee.on('ready', function () {
    console.log('server running');
});

// emitted whenever a recoverable error is encountered (can be ignored, useful
// for debugging)
qsee.on('warning', function (e) {
    console.error('[warning] %s', e.message);
});

// emitted whenever an alert is seen (an email is sent from the DVR)
qsee.on('alert', function (obj) {
    console.log(JSON.stringify(obj, null, 2));
});
