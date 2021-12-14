
const winston = require('winston');  // 로그 파일 및 로그 레벨 관리 모듈 
const winstonDaily = require('winston-daily-rotate-file');  // 매일 날짜 별로 로그 파일 생성 및 관리 모듈 ( 시간이 지나면 자동으로 삭제 & 압축 관리 )
const fs = require('fs');
const path = require('path');

const { combine, timestamp, printf, colorize } = winston.format;

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4, }
const level = () => { 
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn' ;
}

const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'blue', }
winston.addColors(colors);

const logDir = path.join( __dirname, '../logs');  // logs 디렉토리 하위에 로그 파일 저장
if(!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});
/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
    format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        colorize({ all: true}),
        logFormat,
    ),
    // level: level(), 
    transports: [
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.log`,
            maxSize: '20m',
            maxFiles: '30d',
            zippedArchive: true, 
        }),
        new winstonDaily({
            level: 'warn',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/warn',
            filename: `%DATE%.warn.log`,
            maxSize: '20m',
            maxFiles: '30d',
            zippedArchive: true, 
        }),
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error',
            filename: `%DATE%.error.log`,
            maxSize: '20m',
            maxFiles: '30d',
            zippedArchive: true,
        }),
    ],
});

logger.stream = {// morgan wiston 설정
    write: message => {
        logger.info(message);
    }
} 

// Production 환경이 아닌 경우(dev 등) 배포 환경에서는 최대한 자원을 안잡아 먹는 로그를 출력해야함
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize({ all: true }), // console 에 출력할 로그 컬러 설정 적용함
            logFormat // log format 적용
        )
    }));
}

module.exports = logger;


// https://velog.io/@gwon713/Express-winston-morgan-%EB%A1%9C%EA%B7%B8-%EA%B4%80%EB%A6%AC
// https://loy124.tistory.com/380
// https://for-development.tistory.com/51
// https://xively.tistory.com/21