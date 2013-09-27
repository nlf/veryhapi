var Hapi = require('hapi');
var rack = require('hat').rack();
var server = new Hapi.Server('127.0.0.1', 8000);

var data = {
    users: {},
    posts: {}
};

var controller = {
    index: function (name, callback) {
        var items = [];
        for (var key in data[name]) {
            items.push(data[name][key]);
        }
        callback(null, items);
    },
    create: function (name, object, callback) {
        object.id = rack();
        data[name][object.id] = object;
        callback(null, object);
    },
    retrieve: function (name, id, callback) {
        callback(null, data[name][id]);
    },
    update: function (name, id, object, callback) {
        object.id = id;
        data[name][id] = object;
        callback(null, object);
    },
    delete: function (name, id, callback) {
        var old = data[name][id];
        delete data[name][id];
        callback(null, old);
    }
};

server.pack.require('../', { models: './models', controller: controller }, function (err) {
    if (err) throw err;
    server.start(function () {
        console.log('Example server running at', server.info.uri);
    });
});
