Q-See Alerts
============

This module will create an SMTP on a given host:port combination to listen for
incoming email messages from a [Q-See](https://q-see.com/) NVR.

Setup
-----

In order to use this module, you must instruct your NVR to send email alerts to
this server by modifying the correct values in the config->network->email
section of the web interface (or however your NVR has it labeled).

Note: this has only been tested on the Qth-8Cn-2 model, as that's what I have.

Here's an example from my NVR.

![email-settings](/assets/config.png)

- `SMTP Server` - The IP address or hostname where this module will be listening
- `Port` - The Port where this module will be listening
- `SSL Check` - Whether or not to use SSL - this module currently does support it so leave it unchecked
- `Send Addr` - called the "username" by this module - used for the extremely basic auth check (must look like an email address)
- `Password` - called the "password" by this module - used for the same auth as above and can be pretty much anything
- `Receive Addr1` - must be set and must look like an email address, though this is discarded by this module
- `Attaching Image` - whether or not you want to send image attachments with the email

Once these settings have been set properly, you can create an SMTP server with
this module like this

``` js
var QSeeAlertsServer = require('qsee-alerts').QSeeAlertsServer;

var opts = {
    host: '0.0.0.0',           // SMTP Server listen host
    port: 10465,               // SMTP Server listen port
    username: 'foo@test.com',  // valid username for sending email, `Send Addr` in the NVR config
    password: 'bar'            // valid password for sending email.  `Password` in the NVR config
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
```

Now all that's left is to generate some alerts, either by creating motion or
disconnecting a camera... you should see output like:

```
server running
{
  "subject": "Alarm Message From Device qsee.",
  "date": "2017-03-22T05:36:44.942Z",
  "from": "foo@test.com",
  "to": "canbe@anything.com",
  "rawBody": "Device ID: 0, Device Name: qsee\n\n\nChannel ID: 3, Camera Name:Street\nAlarm Type:Motion Alarm, Time:2017-3-22 01:36:46\n\n",
  "data": {
    "Device ID": "0",
    "Device Name": "qsee",
    "Channel ID": "3",
    "Camera Name": "Street",
    "Alarm Type": "Motion Alarm",
    "Time": "2017-3-22 01:36:46"
  }
}
{
  "subject": "Alarm Message From Device qsee.",
  "date": "2017-03-22T05:36:57.474Z",
  "from": "foo@test.com",
  "to": "canbe@anything.com",
  "rawBody": "Device ID: 0, Device Name: qsee\n\n\nChannel ID: 2, Camera Name:Backyard\nAlarm Type:Motion Alarm, Time:2017-3-22 01:36:59\n\n",
  "data": {
    "Device ID": "0",
    "Device Name": "qsee",
    "Channel ID": "2",
    "Camera Name": "Backyard",
    "Alarm Type": "Motion Alarm",
    "Time": "2017-3-22 01:36:59"
  }
}
```

Attachments
-----------

If you would like to receive attachments (images) as well, you can call the
constructor like:

``` js
var opts = {
    host: '0.0.0.0',
    port: 10465,
    username: 'foo@test.com',
    password: 'bar',
    parseAttachments: true
};
```

Now, when an alert is received, if there is an attachment with the email it
will be contained in the `attachments` key like

``` js
{ attachments: { files: [ [Object] ] },
  subject: 'Alarm Message From Device qsee.',
  date: 2017-03-22T05:48:44.939Z,
  from: 'foo@test.com',
  to: 'canbe@anything.com',
  rawBody: 'Device ID: 0, Device Name: qsee\n\n\nChannel ID: 2, Camera Name:Backyard\nAlarm Type:Motion Alarm, Time:2017-3-22 01:48:46\n\n',
  data:
   { 'Device ID': '0',
     'Device Name': 'qsee',
     'Channel ID': '2',
     'Camera Name': 'Backyard',
     'Alarm Type': 'Motion Alarm',
     Time: '2017-3-22 01:48:46' } }
[ { data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff db 00 c5 00 03 02 02 03 02 02 03 03 03 03 04 03 03 04 05 08 05 05 04 04 05 0a 07 07 06 ... >,
    filename: 'CH02_170322014847.jpg' } ]
```

Where `attachments.files` is an array of objects for each attachment seen that
contains `data` (the raw buffer of the attachment) and `filename` (the name
given by the NVR).

Alternatively, this module can save the attachments automatically to files if
given `attachmentsDir`

``` js
var opts = {
    host: '0.0.0.0',
    port: 10465,
    username: 'foo@test.com',
    password: 'bar',
    parseAttachments: true,
    attachmentsDir: path.join(__dirname, 'data')
};
```

Now, when an alert is received, if there is an attachment with the email it
will be contained in the `attachments` key like

``` js
{ attachments:
   { files: [ '/home/dave/dev/node-qsee-alerts/data/1490162119637/CH02_170322015523.jpg' ],
     dir: '/home/dave/dev/node-qsee-alerts/data/1490162119637' },
  subject: 'Alarm Message From Device qsee.',
  date: 2017-03-22T05:55:19.660Z,
  from: 'foo@test.com',
  to: 'canbe@anything.com',
  rawBody: 'Device ID: 0, Device Name: qsee\n\n\nChannel ID: 2, Camera Name:Backyard\nAlarm Type:Motion Alarm, Time:2017-3-22 01:55:21\n\n',
  data:
   { 'Device ID': '0',
     'Device Name': 'qsee',
     'Channel ID': '2',
     'Camera Name': 'Backyard',
     'Alarm Type': 'Motion Alarm',
     Time: '2017-3-22 01:55:21' } }
```

Where `attachments` has a `files` array of the full path to the files saved,
and `dir` has a directory that was created to house all the attachments from a
single alert

Installation
------------

    npm install qsee-alerts

License
-------

MIT License
