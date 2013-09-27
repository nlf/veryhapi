var rack = require('hat').rack();

var data = {
    users: {},
    posts: {}
};

module.exports = {
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
