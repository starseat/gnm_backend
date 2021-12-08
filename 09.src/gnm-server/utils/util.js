const isEmpty = function (param) {

    // 일반적인 비어있는지 검사
    if (!param || param == null || param == undefined || param == '' || param.length == 0) {
        return true;
    }
    // Object 인데 비어 있을 수 있으므로 ( param = {}; )
    else {
        // object 형 이라면
        if (String(typeof param).toLowerCase() === 'object') {
            // key 를 추출하여 key length 검사
            if (Object.keys(param).length === 0) {
                return true;
            } else {
                return false;
            }
        }
    }
};

// number 체크
const isNumber = function(num, opt) {
	// 좌우 trim(공백제거)을 해준다.
	num = String(num).replace(/^\s+|\s+$/g, "");
	
	if(typeof opt == "undefined" || opt == "1"){
		// 모든 10진수 (부호 선택, 자릿수구분기호 선택, 소수점 선택)
		var regex = /^[+\-]?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
	}else if(opt == "2"){
		// 부호 미사용, 자릿수구분기호 선택, 소수점 선택
		var regex = /^(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
	}else if(opt == "3"){
		// 부호 미사용, 자릿수구분기호 미사용, 소수점 선택
		var regex = /^[0-9]+(\.[0-9]+)?$/g;
	}else{
		// only 숫자만(부호 미사용, 자릿수구분기호 미사용, 소수점 미사용)\
		var regex = /^[0-9]$/g;
	}
	
	if( regex.test(num) ){
		num = num.replace(/,/g, "");
		return isNaN(num) ? false : true;
	}else{ return false;  }
}

const getToday = function(separator) {
    if(isEmpty(separator)) separator = '-';

    let today = new Date();

    let year = String(today.getFullYear()); // 년도
    let month = String(today.getMonth() + 1);  // 월
    let date = String(today.getDate());  // 날짜
    // let day = today.getDay();  // 요일

    if(parseInt(month, 10) < 10 ) month = '0' + month;
    if(parseInt(date,  10) < 10 ) date  = '0' + date;

    return year + separator + month + separator + date;
};

const getTodayNoSep = function() {
    let today = new Date();

    let year = String(today.getFullYear());
    let month = String(today.getMonth() + 1);
    let date = String(today.getDate());

    if(parseInt(month, 10) < 10 ) month = '0' + month;
    if(parseInt(date,  10) < 10 ) date  = '0' + date;

    return year + month + date;
};

/**
 * @method strReplaceAll
 * 
 * @param  {String}   str         [target string]
 * @param  {String}   searchStr   [search string]
 * @param  {String}   replaceStr  [replace string]
 * 
 * @author jw.lee
 * @Date   2019.11.28
 * 
 * @Desc   str 로 받은 문자열에서 searchStr 로 받은 문자열을 replaceStr 로 모두 변환
 */
const strReplaceAll = function(str, searchStr, replaceStr) {
	return str.split(searchStr).join(replaceStr);
}

module.exports = {
    isEmpty, isNumber, getToday, getTodayNoSep, strReplaceAll
};
