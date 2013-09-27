var Hoek = require('hoek');
var VeryModel = require('verymodel');
var fs = require('fs');
var path = require('path');

var internals = {
    error: null,
    controller: null,
    models: {},
    configs: {},
    routes: []
};

function _registerModels(plugin, modPath, next) {
    var isDir;
    var isJS;
    var fullPath;
    var baseName;

    // get a list of everything in the models directory
    fs.readdir(modPath, function (err, files) {
        if (err) throw err;
        // iterate over them
        files.forEach(function (file) {
            // process.cwd() is an ugly hack, this should definitely be better
            fullPath = path.resolve(process.cwd(), modPath, file);
            isDir = fs.statSync(fullPath).isDirectory();
            isJS = path.extname(file).toLowerCase() === '.js';
            // if it's not a directory or javascript, we don't care so ignore it
            if (!isDir && !isJS) return;

            // require the model and pass it the VeryModel and VeryValidator we have here
            require(fullPath)(VeryModel.VeryModel, VeryModel.VeryValidator, function (err, model, config) {
                if (err) throw err;
                // the baseName will become the name of the resource
                baseName = path.basename(file, '.js');

                internals.models[baseName] = model;
                internals.configs[baseName] = config;
            });
        });
        _generateRoutes(plugin, next);
    });
}

function _indexHandler(name) {
    return function (request) {
        internals.controller.index(name, function (err, items) {
            if (err) return request.reply(internals.error.internalError(err));
            var reply = {};
            reply[name] = items;
            request.reply(reply);
        });
    };
}

function _createHandler(name) {
    return function (request) {
        var item = internals.models[name].create(request.payload);
        var errors = item.doValidate();
        if (errors.length) return request.reply(internals.error.badRequest(errors[0]));
        internals.controller.create(name, request.payload, function (err, item) {
            if (err) return request.reply(internals.error.internalError(err));
            request.reply(item);
        });
    };
}

function _retrieveHandler(name) {
    return function (request) {
        internals.controller.retrieve(name, request.params.id, function (err, object) {
            if (err) return request.reply(internals.error.internalError(err));
            if (!object) return request.reply(internals.error.notFound());
            request.reply(object);
        });
    };
}

function _updateHandler(name) {
    return function (request) {
        var item = internals.models[name].create(request.payload);
        var errors = item.doValidate();
        if (errors.length) return request.reply(internals.error.badRequest(errors[0]));
        internals.controller.update(name, request.params.id, request.payload, function (err, item) {
            if (err) return request.reply(internals.error.internalError(err));
            request.reply(item);
        });
    };
}

function _deleteHandler(name) {
    return function (request) {
        internals.controller.delete(name, request.params.id, function (err, item) {
            if (err) return request.reply(internals.error.internalError(err));
            request.reply(item);
        });
    };
}

function _generateRoutes(plugin, next) {
    var config;

    for (var key in internals.models) {
        if (internals.configs[key]) config = internals.configs[key];

        // index
        internals.routes.push({
            method: 'GET',
            path: '/' + key,
            config: config,
            handler: _indexHandler(key)
        });

        internals.routes.push({
            method: 'POST',
            path: '/' + key,
            config: config,
            handler: _createHandler(key)
        });

        internals.routes.push({
            method: 'GET',
            path: '/' + key + '/{id}',
            config: config,
            handler: _retrieveHandler(key)
        });

        internals.routes.push({
            method: 'PUT',
            path: '/' + key + '/{id}',
            config: config,
            handler: _updateHandler(key)
        });

        internals.routes.push({
            method: 'DELETE',
            path: '/' + key + '/{id}',
            config: config,
            handler: _deleteHandler(key)
        });
    }

    plugin.route(internals.routes);
    next();
}

exports.register = function (plugin, options, next) {
    Hoek.assert(typeof options.models === 'string', 'Models property must be a string');
    Hoek.assert(typeof options.controller === 'object', 'Controller property must be an object');
    Hoek.assert(typeof options.controller.index === 'function', 'Controller\'s index property must be a function');
    Hoek.assert(typeof options.controller.create === 'function', 'Controller\'s create property must be a function');
    Hoek.assert(typeof options.controller.retrieve === 'function', 'Controller\'s retrieve property must be a function');
    Hoek.assert(typeof options.controller.update === 'function', 'Controller\'s update property must be a function');
    Hoek.assert(typeof options.controller.delete === 'function', 'Controller\'s delete property must be a function');

    internals.controller = options.controller;
    internals.error = plugin.hapi.error;

    _registerModels(plugin, options.models, next);
};
