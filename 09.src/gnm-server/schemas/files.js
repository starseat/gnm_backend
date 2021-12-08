const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const _schema = new Schema({
    type: {  // image, etc...
        type: String, 
        required: true,
    }, 
    name: {
        type: String, 
        required: true
    }, 
    saved_name: {
        type: String, 
        required: true
    }, 
    // 저장된 경로
    saved_path: {
        type: String, 
        required: true
    }, 
    // 웹에서 호출할 경로
    upload_path: {
        type: String, 
        required: true
    }, 
    storage_type: {
        type: String, 
        required: true, 
        default: 'L'  // L: local, W: Web
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    },
});

module.exports = mongoose.model('files', _schema);
