const utils = {
    Result: require('./result'), 
    Util: require('./util'),
    Winston: require('winston')
};

utils.Logger = utils.winston;

module.exports = utils;
