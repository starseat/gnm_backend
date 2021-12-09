const express = require("express");
// express async/await 의 exception 처리
const asyncify = require('express-asyncify');
// const path = require('path');

////////////////////////////////////////////////////////////////////////////////////////////////////
// logging
const logger = require('./utils/winston');

const morgan = require('morgan'); // request 요청 로깅 미들웨어
const combined = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'; // 기존 combined 포멧에서 timestamp만 제거
const morganFormat = process.env.NODE_ENV !== 'production' ? 'development' : combined; // morgan 출력 형태

const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');



// const cors = require('cors')();
const cors = require('cors');


// mongoose (MongoDB)
var mongo = require('./schemas');

const utils = require('./utils');
const routes = require('./routes');

const app = express();
// const app = asyncify(express());  // asyncify 적용

const env = process.env.NODE_ENV || 'development';  // production
const PORT = ((env === 'production') ? process.env.PROD_PORT : process.env.DEV_PORT) || 9090;

// mongoose connect
mongo();

require('dotenv').config();
app.use(morgan('common', {stream: fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'}) }));
app.use(morgan('dev'));
// app.use(morgan(morganFormat, {stream : logger.stream}));
/*
morgan(format)
- format
  + 'combined', 'tiny', 'dev', 'common'
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(cors());

// app.use(express.static('uploads'));
app.use(routes);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     const err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });
// app.use(function(req, res, next) {
//     console.log('error 404');
//     next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
  
//     // render the error page
//     res.status(err.status || 500);
//     // res.status(res.statusCode || 500);
//     res.render('error');
//     // res.json({ error: err.message || 'internal server error' });
// });
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // console.log('[gnm server] internal server error. ', err);
  logger.error('[gnm server] internal server error. ' + err.message);
  let _status = err.status || 500;
  res.status(_status);
  res.json(utils.Result.makeErrorResult(_status, err.message));
});

app.listen(PORT, () => {
    logger.info(`[gnm server] listen... (${PORT})`);
});
