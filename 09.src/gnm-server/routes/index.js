const { Util, Result } = require('../utils');
const logger = require('../utils/winston');

const express = require('express');
const router = express.Router();

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

router.post('/test/upload', upload.single('uploadFile'), async (req, res, next) => {
    // console.log('upload() - req.params:: ', req.params);
    // console.log('upload() - req.body:: ', req.body);
    // console.log('upload() - req.file:: ', req.file);

    try {
        const file = await Files.create({
            type: req.file.mimetype.includes('image') ? 'image' : 'file', 
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

        logger.info('[Upload] file upload success. data: ' + JSON.stringify(result));
        res.status(201).json(Result.makeSuccessResult(result));
    } catch (_err) {
        logger.error('[Upload] file upload failed. filename: ' + file.name);
        res.status(500).json(Result.makeErrorResult('file save filed. ' + _err.message));
    }
});

module.exports = router;
