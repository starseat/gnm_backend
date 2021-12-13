const { Util, Result } = require('../utils');
const logger = require('../utils/winston');

const express = require('express');
const router = express.Router();

const _LOG_TAG_UPLOAD = '[Upload]';

router.get('/', (req, res) => {
    res.status(200);
    res.json(Result.makeSuccessResult('gnm api server.'));
});

////////////////////////////////////////////////////////////
// upload
//이미지 저장되는 위치 설정
const path = require('path');
const uploadDir = path.join( __dirname , '../uploads' ); // 루트의 uploads위치에 저장한다.
const fs = require('fs');
const { uuid } = require('uuidv4');

// 하위 디렉토리 모두 사용을 위하여 변경 (mkdir -p)
const mkdirp = require('mkdirp');

//multer 셋팅
const multer  = require('multer');
const storage = multer.diskStorage({
    destination :  (req, file, callback) => { //이미지가 저장되는 도착지 지정 
        const targetUploadPath = path.join(uploadDir, Util.getTodayNoSep());
        fs.readdir(targetUploadPath, (error) => {
            if(error) {
                //fs.mkdirSync(targetUploadPath);
                mkdirp.sync(targetUploadPath);
            }
            callback(null, targetUploadPath);
        });
    },
    filename :  (req, file, callback) => { // products-날짜.jpg(png) 저장 
        const savedName = uuid() + path.extname(file.originalname);
        callback(null,  savedName);
    }
});
const upload = multer({ storage: storage });
const Files = require('../schemas/files');

router.post('/api/upload', upload.single('uploadFile'), async (req, res, next) => {
    // console.log('upload() - req.params:: ', req.params);
    // console.log('upload() - req.body:: ', req.body);
    // console.log('upload() - req.file:: ', req.file);

    try {
        const file = await Files.create({
            type: req.file.mimetype.includes('image') ? 'image' : 'file', 
            mime: req.file.mimetype,
            name: req.file.originalname,
            saved_name: req.file.filename,
            saved_path: req.file.destination, 
            upload_path: '/uploads/' + path.basename(req.file.destination), 
            storage_type: req.body.storage_type || 'L'
        });

        const mResult = await Files.populate(file, { path: 'files' });
        const result = {
            _id: mResult._id.toString(), 
            name: file.name,
            saved_name: file.saved_name,
            upload_path: file.upload_path
        }

        logger.info(`${_LOG_TAG_UPLOAD} file upload success. data: ${JSON.stringify(result)}`);
        res.status(201).json(Result.makeSuccessResult(result));
    } catch (_err) {
        logger.error(`${_LOG_TAG_UPLOAD} file upload failed. filename: ${req.file.originalname}`);
        res.status(500).json(Result.makeErrorResult(500, 'file save filed. ' + _err.message));
    }
});

router.get('/api/uploads', async (req, res, next) => {
    logger.debug(`${_LOG_TAG_UPLOAD} get file info list.`);
    try {
        const files = await Files.find().select('_id type name saved_name upload_path storage_type');
        res.status(200).json(Result.makeSuccessResult(files));
    } catch (_err) {
        logger.error(`${_LOG_TAG_UPLOAD} failed to get file info list. ${_err.message}`);
        res.status(500).json(Result.makeErrorResult(500, 'fail to upload file list. ' + _err.message));
    }
});

router.get('/api/upload/:id', async (req, res, next) => {
    logger.debug(`${_LOG_TAG_UPLOAD} get file info. id: ${req.params.id}`);
    try {
        const file = await Files.find().where('_id').equals(req.params.id).select('_id type name saved_name upload_path storage_type');
        res.status(200).json(Result.makeSuccessResult(file));
    } catch (_err) {
        logger.error(`${_LOG_TAG_UPLOAD} failed to get file info. ${_err.message}`);
        res.status(500).json(Result.makeErrorResult(500, 'failed to get file info. ' + _err.message));
    }
})

router.get('/api/img/uploads/:date/:filename', async (req, res, next) => {
    const _ext = path.extname(req.params.filename);
    const _file = uploadDir + '/' + req.params.date + '/' + req.params.filename;
    logger.debug(`${_LOG_TAG_UPLOAD} get file data. file: ${_file}`);
    fs.readFile(_file, (error, data) => {
        res.writeHead(200, { 'Content-Type': 'image/' + _ext });
        res.end(data);
    });
});

router.delete('/api/upload/:id', async (req, res, next) => {
    try {
        const deleteId = req.params.id;
        logger.info(`${_LOG_TAG_UPLOAD} file remove. id: ${deleteId}`);
        const files = await Files.find().where('_id').equals(deleteId);
        if(files.length <= 0) {
            logger.error(`${_LOG_TAG_UPLOAD} file info delete failed. file data not found. id: ${deleteId}`);
            res.status(404).json(Result.makeErrorResult(404, 'upload image file data not found.'));
            return;
        }
        const file = files[0];
        const deleteFile = path.join(file.saved_path, '/' + file.saved_name); 

        const deleteCount = await Files.deleteOne({_id: deleteId});
        fs.unlink(deleteFile, (err) => {
            if(err) {
                logger.error(`${_LOG_TAG_UPLOAD} file remove failed. id: ${deleteId}, msg: ${err.message}`);
            }
        });

        res.status(200).json(Result.makeSuccessResult(deleteCount));
    } catch (_err) {
        logger.error(`${_LOG_TAG_UPLOAD} file remove failed. ${_err.message}`);
        res.status(500).json(Result.makeErrorResult(500, 'file remove failed. ' + _err.message));
    }
});

module.exports = router;
