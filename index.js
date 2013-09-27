var Hoek = require('hoek');
var VeryModel = require('verymodel');
var fs = require('fs');
var path = require('path');

var internals = {
    models: {},
    configs: {}
};

function _registerModels(modPath, next) {
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
        console.log(require('util').inspect(internals, false, null, true));
        next();
    });
}

exports.register = function (plugin, options, next) {
    Hoek.assert(typeof options.models === 'string', 'Models property must be a string');

    _registerModels(options.models, next);
};
