const logger = require('../utils/winston');
const mongoose = require('mongoose');

require('dotenv').config();

const connect = () => {
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }

    // mongodb://{ID}:{Password}@{host}:{port}/{db}[?options]
    logger.info(`[Moongoose] connect info: ${process.env.MONGO_URI}`);    
    mongoose.connect(process.env.MONGO_URI, {
        // dbName: 'gnm',
        // useNewUrlParser: true,
        // useCreateIndex: true,
    }, (_error) => {
        if(_error) {
            logger.info('[Moongoose] db connection error: ' + _error);
        }
        else {
            logger.info('[Moongoose] db connection success!');                
        }
    });
};

mongoose.connection.on('error', (_error) => {
    logger.info('[Moongoose] db connection error (2): ', _error);
});

mongoose.connection.on('disconnected', () => {
    logger.info('[Moongoose] db connection refused...');
    logger.info('[Moongoose] db retry connect.');
    connect();
});

module.exports = connect;
    
