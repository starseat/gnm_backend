const makeErrorResult = (code, msg) => {
    const retObj = {
        code,
        result: false,
        message: msg
    };

    return retObj;
};

const makeSuccessResult = (data) => {
    const retObj = {
        code: 0,
        result: true
    }

    if (data != 'undefined' && data != null) {
        retObj.data = data;
    }

    return retObj;
}

const makeResult = (code, data, msg) => {
    let retObj;
    if(code == 0) {
        retObj = makeSuccessResult(data);
    }
    else {
        retObj = makeErrorResult(code, msg);
    }

    return retObj;
}

module.exports = {
    makeErrorResult,
    makeSuccessResult,
    makeResult
};