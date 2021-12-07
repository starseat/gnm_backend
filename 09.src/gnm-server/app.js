const express = require("express");
// express async/await 의 exception 처리
const asyncify = require('express-asyncify');

const createError = require('http-errors');
const path = require('path')
const cookieParser = require('cookie-parser');
const logger = require('morgan');  // 변수명 morgan -> logger 로 변경


const cors = require('cors')();

const routes = require('./routes');

const app = express();
// const app = asyncify(express());  // asyncify 적용

const env = process.env.NODE_ENV || 'development';  // production
const PORT = ((env === 'production') ? process.env.PROD_PORT : process.env.DEV_PORT) || 9090;

require('dotenv').config();

app.use(logger('dev'));
/*
logger(format)
- format
  + 'combined', 'tiny', 'dev', 'common'
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

app.use(routes);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     const err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });
app.use(function(req, res, next) {
    console.log('error 404');
    next(createError(404));
});

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
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => {
    console.log('[gnm server] listen... (' + PORT + ')');
});
