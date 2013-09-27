var Hapi = require('hapi');
var server = new Hapi.Server('127.0.0.1', 8000);

server.pack.require('../', { models: './models' }, function (err) {
    if (err) throw err;
    server.start(function () {
        console.log('Example server running at', server.info.uri);
    });
});
