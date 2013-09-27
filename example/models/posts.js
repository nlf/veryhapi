module.exports = function (VeryModel, VeryValidator, callback) {
    var userdef = {
        title: {
            required: true,
            type: 'alphanumeric'
        }
    };

    var Post = new VeryModel(userdef);
    var config = {
        plugins: {
            authz: {
                test: 'one'
            }
        }
    };

    callback(null, Post, config);
};
