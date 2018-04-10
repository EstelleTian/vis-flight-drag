/**
 * 依托JQuery扩展工具JS
 *
 * Author Zhaochen
 */
jQuery.extend({
    /**
     * 判断是否为有效变量
     *
     * @param variable
     */
    isValidVariable : function(variable) {
        if (variable !== undefined && variable != null && variable != 'null') {
            if (this.type(variable) === 'string') {
                if (this.trim(variable) != '') {
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * 判断是否是有效对象和数组（用于ajax回调验证数据是否有值）
     */
    isValidObject : function( data ){
        if( data && ($.trim(data) != "") && (typeof data == "object") ){
            for(var i in data){
                if(i){
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * 合并表单name值相同数据，以,连接
     *
     * @param $form 表单对象
     *
     * @return {} Object
     */
    ajaxDataCombine : function( $form ){
        var datas = {};
        var dArr =  $form.serializeArray();
        //遍历
        dArr.forEach(function(item){
            var name = item.name;
            if($.isValidVariable(name)){
                //若数据不存在，添加
                if(!datas[name]){
                    datas[name] = item.value;
                }else{//若数据存在，追加
                    //若数据值为空，不追加
                    if($.isValidVariable(item.value)){
                        datas[name] += "," + item.value;
                    }
                }
            }
        });
        return datas;
    },
    /**
     * 判断两个对象是否内容相同
     *
     * @param o1
     * @param o2
     */
    isEquals : function(o1, o2) {

        if (this.type(o1) != this.type(o2)) {
            return false;
        }

        if (o1 == null || o2 == null) {
            return o1 == o2;
        }

        if (this.type(o1) == 'object' || this.type(o1) == 'array') {
            if (this.getObjectLength(o1) != this.getObjectLength(o2)) {
                return false;
            }
            for ( var key in o1) {
                if (typeof o2[key] == 'undefined') {
                    return false;
                }
                if (!this.isEquals(o1[key], o2[key])) {
                    return false;
                }
            }
            return true;
        } else {
            return o1.toString() == o2.toString();
        }

    },

    /**
     * 获取对象属性长度
     *
     * @param o
     * @returns
     */
    getObjectLength : function(o) {
        var length = 0;
        if (!$.type(o) == 'object') {
            return undefined;
        } else {
            for ( var key in o) {
                o[key];
                length++;
            }
        }
        return length;
    },

    /**
     * 获取Date对象的yyyyMMddHHmm格式数据
     *
     * @param date
     * @returns
     */
    getFullTime : function(date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var mins = date.getMinutes();
        year = '' + year;
        month = month < 10 ? '0' + month : '' + month;
        day = day < 10 ? '0' + day : '' + day;
        hour = hour < 10 ? '0' + hour : '' + hour;
        mins = mins < 10 ? '0' + mins : '' + mins;
        var fullTime = year + month + day + hour + mins;
        return fullTime;
    },

    /**
     * 解析yyyyMMddHHmm格式时间
     *
     * @param str
     *            yyyyMMddHHmm
     * @returns {Date}
     */
    parseFullTime : function(str) {
        // 按照十进制解析
        var year = parseInt(str.substring(0, 4), 10);
        var month = parseInt(str.substring(4, 6), 10) - 1;
        var day = parseInt(str.substring(6, 8), 10);
        var hour = parseInt(str.substring(8, 10), 10);
        var mins = parseInt(str.substring(10, 12), 10);

        var date = new Date();
        date.setFullYear(year, month, day);
        date.setHours(hour);
        date.setMinutes(mins);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    },

    /**
     * 时间加减
     *
     * @param time
     *            yyyyMMddHHmm
     * @param addMillis
     * @returns {String}
     */
    addStringTime : function(time, addMillis) {
        var date = this.parseFullTime(time);
        var newDate = this.addDateTime(date, addMillis);
        var newStringTime = this.getFullTime(newDate);
        return newStringTime;
    },

    /**
     * 时间加减
     *
     * @param date
     *            yyyyMMddHHmm
     * @param addMillis
     * @returns {Date}
     */
    addDateTime : function(date, addMillis) {
        var newDateMillis = date.getTime() + addMillis;
        var newDate = new Date();
        newDate.setTime(newDateMillis);
        return newDate;
    },

    /**
     * 计算两个时间差, 返回毫秒值
     *
     * @param time1
     *            yyyyMMddHHmm
     * @param time2
     *            yyyyMMddHHmm
     * @returns {Number}
     */
    calculateStringTimeDiff : function(time1, time2) {
        var millis1;
        if( !$.isValidVariable(time1) ){
            millis1 = 0;
        }else{
            millis1 = this.parseFullTime(time1).getTime();
        }

        var millis2;
        if( !$.isValidVariable(time2) ){
            millis2 = 0;
        }else{
            millis2 = this.parseFullTime(time2).getTime();
        }
        return millis1 - millis2;
    },

    /**
     * 格式化字符串时间为dd/HHmm格式
     *
     * @param time
     * @returns {*}
     */
    formatTimeDDHHMM: function (time) {
        if ($.isValidVariable(time)) {
            var day = time.substr(6, 2);
            var hhmm = time.substr(8, 4);
            return day + '/' + hhmm;
        } else {
            return '';
        }
    }

});