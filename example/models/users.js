module.exports = function (VeryModel, VeryValidator, callback) {
    var userdef = {
        id: {
            primary: true,
            type: 'alphanumeric'
        },
        name: {
            required: true,
            type: 'alphanumeric'
        }
    };

    var User = new VeryModel(userdef);
    var config = {
        plugins: {
            authz: {
                test: 'one'
            }
        }
    };

    callback(null, User, config);
};
