
const tradeTools = {
    getPrecisionConfig(market) {
        let precision = GLOBAL_PRO_TRADE.precision[market.toUpperCase()];
        if (precision) {
            return precision
        }
        precision = GLOBAL_PRO_TRADE.precision[GLOBAL_PRO_TRADE.currSymbol];
        if (precision) {
            return precision
        }
        const {precision_vol, precision_total, precision_rate, precision_amount} = GLOBAL_PRO_TRADE;
        return {
            precision_vol,
            precision_total,
            precision_rate,
            precision_amount
        }
    },
    rand(min, max) {
        return Math.floor(Math.random() * max + min)
    },
    loadStyles(url, id, targetTag='head') {
        if (id && document.getElementById(id)) {
            return
        }
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        id && (link.id = id);
        document.getElementsByTagName(targetTag)[0].appendChild(link)
    },
    FormatTime(time) {
        var timestamp = time;
        var arrTimestamp = (timestamp + '').split('');
        for (var start = 0; start < 13; start++) {
            if (!arrTimestamp[start]) {
                arrTimestamp[start] = '0'
            }
        }
        timestamp = arrTimestamp.join('') * 1;
        var minute = 1e3 * 60;
        var hour = minute * 60;
        var day = hour * 24;
        var halfamonth = day * 15;
        var month = day * 30;
        var now = new Date().getTime();
        var diffValue = now - timestamp;
        if (diffValue < 0) {
            return lang_string('1分钟内')
        }
        var monthC = diffValue / month;
        var weekC = diffValue / (7 * day);
        var dayC = diffValue / day;
        var hourC = diffValue / hour;
        var minC = diffValue / minute;
        var zero = function(value) {
            if (value < 10) {
                return '0' + value
            }
            return value
        };
        if (monthC > 12) {
            return (function() {
                var date = new Date(timestamp);
                return date.getFullYear() + '/' + zero(date.getMonth() + 1) + '/' + zero(date.getDate()) + '/'
            }
            )()
        } else if (monthC >= 1) {
            return lang_string('$0$月前', [parseInt(monthC)])
        } else if (weekC >= 1) {
            return lang_string('$0$周前', [parseInt(weekC)])
        } else if (dayC >= 1) {
            return lang_string('$0$天前', [parseInt(dayC)])
        } else if (hourC >= 1) {
            return lang_string('$0$小时前', [parseInt(hourC)])
        } else if (minC >= 1) {
            return lang_string('$0$分钟前', [parseInt(minC)])
        }
        return lang_string('1分钟内')
    },
    genDecimals(length) {
        let decimal = '0.';
        for (let i = 0; i < length - 1; i++) {
            decimal += '0'
        }
        decimal += '1';
        return decimal
    },
    numSub(num1, num2) {
        num1 = tradeTools.transferToNumber(num1);
        num2 = tradeTools.transferToNumber(num2);
        var baseNum, baseNum1, baseNum2;
        var precision;
        try {
            baseNum1 = num1.toString().split('.')[1].length
        } catch (e) {
            baseNum1 = 0
        }
        try {
            baseNum2 = num2.toString().split('.')[1].length
        } catch (e) {
            baseNum2 = 0
        }
        baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
        precision = baseNum1 >= baseNum2 ? baseNum1 : baseNum2;
        return ((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision)
    },
    numAdd(num1, num2) {
        var baseNum, baseNum1, baseNum2;
        try {
            baseNum1 = num1.toString().split('.')[1].length
        } catch (e) {
            baseNum1 = 0
        }
        try {
            baseNum2 = num2.toString().split('.')[1].length
        } catch (e) {
            baseNum2 = 0
        }
        baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
        return (num1 * baseNum + num2 * baseNum) / baseNum
    },
    num_fix(num, dec) {
        let num_fixed = tradeTools.num_need_fix(tradeTools.num_no_exponential(num), dec);
        return num_fixed ? num_fixed : num.toString()
    },
    transferToNumber(inputNumber) {
        if (inputNumber == '') {
            return ''
        }
        if (isNaN(inputNumber)) {
            return inputNumber
        }
        inputNumber = '' + inputNumber;
        inputNumber = parseFloat(inputNumber);
        let eformat = inputNumber.toExponential();
        let tmpArray = eformat.match(/\d(?:\.(\d*))?e([+-]\d+)/);
        let number = inputNumber.toFixed(Math.max(0, (tmpArray[1] || '').length - tmpArray[2]));
        return number
    },
    num_need_fix(num, dec) {
        num = num.toString();
        var index = num.indexOf('.');
        if (index < 0) {
            return false
        }
        if (num.length - index - 1 > dec) {
            if (dec > 0)
                return num.substr(0, index + dec + 1);
            else
                return num.substr(0, index)
        }
        return num
    },
    cut_float_zero(num_str) {
        var index = num_str.indexOf('.');
        if (index < 0) {
            return num_str
        }
        var real_len = num_str.length;
        for (var i = num_str.length - 1; i >= index; i--) {
            if (num_str[i] == '0' || num_str[i] == '.') {
                real_len = i
            } else {
                break
            }
        }
        return num_str.substr(0, real_len)
    },
    num_no_exponential(num) {
        let num_to_fix = Number(num);
        let matched = num_to_fix.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
        if (matched) {
            let fixv = (matched[1] || '').length - matched[2];
            if (fixv > 20)
                fixv = 20;
            return num_to_fix.toFixed(Math.max(0, fixv))
        }
        return 0
    },
    genDecimalsDeep(length) {
        let decimal = '0.';
        for (let i = 0; i < length - 1; i++) {
            decimal += '0'
        }
        decimal += '1';
        if (length === 0)
            decimal = '0.';
        return decimal
    },
    genDepthDecimals(precision) {
        let arr = []
          , length = precision >= 3 ? 3 : precision;
        for (let i = 0; i < length; i++) {
            let tempPrec = precision - i;
            let interval = this.genDecimals(tempPrec);
            let tempObj = {
                precision: tempPrec,
                value: interval
            };
            arr.push(tempObj)
        }
        return arr
    },
    addDepthOption(value, opts) {
        try {
            const v = +value;
            const isOne = opts.find(r=>r.value === '1');
            if (v >= 10 && v < 100) {
                !isOne && opts.push({
                    value: '1',
                    precision: 0
                })
            } else if (v >= 100 && v <= 1e3) {
                !isOne && opts.push({
                    value: '1',
                    precision: 0
                });
                opts.push({
                    value: '10',
                    precision: '0'
                })
            } else if (v > 1e3) {
                !isOne && opts.push({
                    value: '1',
                    precision: 0
                });
                opts.push({
                    value: '10',
                    precision: 0
                });
                opts.push({
                    value: '100',
                    precision: 0
                })
            }
        } catch (e) {}
        if (globalStore.currSymbol && globalStore.currSymbol.toLowerCase() === 'btc_usdt') {
            const index = opts.findIndex(r=>r.value === '0.1');
            if (index > -1) {
                opts.splice(index + 1, 0, {
                    value: '0.5',
                    precision: 1
                })
            }
        }
        return opts
    },
    addSupplementOption(opts) {
        if (opts.length > 0) {
            const last = opts[opts.length - 1];
            const splitLen = last.value.split('.');
            const len = splitLen.length > 1 ? splitLen[1].length - 1 : 0;
            for (let i = 0; i < len; i++) {
                let tempPrec = len - i;
                var interval = this.genDecimals(len - i);
                opts.push({
                    precision: tempPrec,
                    value: interval
                })
            }
        }
        return opts
    },
    get_ask_bid_list_vol_sum(orderlist, limit_num, is_ask, rate) {
        let ask_sum = 0;
        let bid_sum = 0;
        if (is_ask) {
            ask_sum = this.get_orderbook_vol_sum(orderlist, 1, limit_num, is_ask, rate)
        } else {
            bid_sum = this.get_orderbook_vol_sum(orderlist, 0, limit_num, is_ask, rate)
        }
        if (bid_sum > ask_sum) {
            return bid_sum
        } else {
            return ask_sum
        }
    },
    get_orderbook_vol_sum(orderlist, is_ask, limit_num, need_ask, rate) {
        var vol_sum = 0;
        if (rate <= 0)
            rate = 0.00000001;
        for (var j = 0; j < orderlist.length; j++) {
            if (j > limit_num)
                break;
            if (is_ask) {
                vol_sum += parseFloat(orderlist[j][1])
            } else {
                vol_sum += parseFloat(orderlist[j][2])
            }
        }
        if (is_ask) {
            if (need_ask) {} else {
                vol_sum *= rate
            }
        } else {
            if (need_ask) {
                vol_sum /= rate
            } else {}
        }
        return vol_sum
    },
    get_local_currency_symbol() {
        let symbol = 'CNY';
        if (GLOBAL_PRO_TRADE.lang === 'cn') {
            symbol = 'CNY'
        } else if (GLOBAL_PRO_TRADE.lang === 'kr') {
            symbol = 'KRW'
        } else {
            symbol = 'USD'
        }
        return symbol
    },
    get_local_symbol_by_lang() {
        let symbol = '$';
        if (GLOBAL_PRO_TRADE.lang === 'cn') {
            symbol = '￥'
        } else if (GLOBAL_PRO_TRADE.lang === 'en') {
            symbol = '$'
        } else if (GLOBAL_PRO_TRADE.lang === 'kr') {
            symbol = '원'
        }
        return symbol
    },
    get_bid_or_ask_decimals(orderlist, curr_b_target, isTop) {
        let curr_b = curr_b_target || '';
        isTop = isTop || false;
        let order_list = orderlist
          , rate0 = 1
          , order_list_type = typeof order_list;
        if (order_list_type === 'object' && order_list.length > 0)
            rate0 = order_list[0][0];
        if (order_list_type === 'string' || order_list_type === 'number')
            rate0 = order_list;
        var fiat_rate = 1
          , fiat = 'USD';
        let curr_fiat = GLOBAL_PRO_TRADE.curr_fiat;
        if (curr_fiat) {
            fiat = curr_fiat
        }
        fiat_rate = this.get_global_fiat_rate(curr_b, fiat);
        const precision = this.getPrecisionConfig(GLOBAL_PRO_TRADE.currSymbol);
        var unitSymbol = this.get_currency_unitSymbol(curr_b);
        return {
            unitSymbol: unitSymbol,
            fiat_rate_decimals: precision.precision_rate,
            fiat_rate: fiat_rate
        }
    },
    get_global_fiat_rate(curr_type) {
        curr_type = curr_type.toUpperCase();
        let fiat_rate = Number(GLOBAL_PRO_TRADE.curr_fiat_market_rates['USD']);
        let curr_fiat = GLOBAL_PRO_TRADE.curr_fiat;
        if (GLOBAL_PRO_TRADE.curr_fiat_market_rates[curr_type]) {
            fiat_rate = Number(GLOBAL_PRO_TRADE.curr_fiat_market_rates[curr_type])
        }
        return fiat_rate
    },
    get_currency_unitSymbol(curr_type) {
        curr_type = curr_type.toUpperCase();
        let unitSymbol = '$';
        if (curr_type === 'BTC') {
            unitSymbol = '฿'
        } else if (curr_type === 'ETH') {
            unitSymbol = 'E'
        } else if (curr_type === 'USDT') {
            unitSymbol = '$'
        } else if (curr_type === 'CNYX') {
            unitSymbol = '¥'
        } else if (curr_type === 'QTUM') {
            unitSymbol = 'Q'
        } else if (curr_type == 'TRY') {
            unitSymbol = '₺'
        } else {
            unitSymbol = '$'
        }
        return unitSymbol
    },
    addDeepListUpDown(oldList, newList) {
        if (!oldList || oldList.length <= 0) {
            return newList
        } else if (!newList || newList.length <= 0) {
            return oldList
        }
        return newList.map(old=>{
            const d = oldList.find(r=>r[0] == old[0]);
            if (!d) {
                return [old[0], old[1], old[2], 0]
            }
            const fl = d[1] > old[1] ? 2 : d[1] < old[1] ? 1 : 0;
            return [old[0], old[1], old[2], fl]
        }
        )
    },
    mergeDepth(a, b, is_sell) {
        let depth = [];
        let pos = {
            a: 0,
            b: 0
        };
        if (is_sell) {
            while (pos.a < a.length || pos.b < b.length) {
                if (typeof a[pos.a] === 'undefined') {
                    const n = b[pos.b++];
                    if (n.length > 3) {
                        n[3] = 0
                    } else {
                        n.push(0)
                    }
                    depth.push(n)
                } else if (typeof b[pos.b] === 'undefined') {
                    const n = a[pos.a++];
                    if (n.length > 3) {
                        n[3] = 0
                    } else {
                        n.push(0)
                    }
                    depth.push(n)
                } else if (parseFloat(a[pos.a][0]) > parseFloat(b[pos.b][0])) {
                    const n = b[pos.b++];
                    if (n.length > 3) {
                        n[3] = 2
                    } else {
                        n.push(2)
                    }
                    depth.push(n)
                } else if (a[pos.a][0] === b[pos.b][0]) {
                    if (parseFloat(b[pos.b][1]) > 0.00000001)
                        depth.push(b[pos.b++]);
                    else
                        pos.b++;
                    pos.a++
                } else {
                    const n = a[pos.a++];
                    if (n.length > 3) {
                        n[3] = 1
                    } else {
                        n.push(1)
                    }
                    depth.push(n)
                }
            }
        } else {
            while (pos.a < a.length || pos.b < b.length) {
                if (typeof a[pos.a] === 'undefined') {
                    const n = b[pos.b++];
                    if (n.length > 3) {
                        n[3] = 0
                    } else {
                        n.push(0)
                    }
                    depth.push(n)
                } else if (typeof b[pos.b] === 'undefined') {
                    const n = a[pos.a++];
                    if (n.length > 3) {
                        n[3] = 0
                    } else {
                        n.push(0)
                    }
                    depth.push(n)
                } else if (parseFloat(a[pos.a][0]) < parseFloat(b[pos.b][0])) {
                    const n = b[pos.b++];
                    if (n.length > 3) {
                        n[3] = 1
                    } else {
                        n.push(1)
                    }
                    depth.push(n)
                } else if (a[pos.a][0] === b[pos.b][0]) {
                    if (parseFloat(b[pos.b][1]) > 0.00000001)
                        depth.push(b[pos.b++]);
                    else
                        pos.b++;
                    pos.a++
                } else {
                    const n = a[pos.a++];
                    if (n.length > 3) {
                        n[3] = 2
                    } else {
                        n.push(2)
                    }
                    depth.push(n)
                }
            }
        }
        return depth
    },
    conversionUnit(num) {
        if (!num || num === '' || typeof num === 'undefined')
            return '';
        if (typeof num !== 'string')
            num = num + '';
        num = parseFloat(num.replace(/,/g, ''));
        if (GLOBAL_PRO_TRADE.lang === 'cn') {
            if (num > 1e8) {
                num = (num / 1e8).toFixed(2) + '亿'
            } else if (num > 1e4) {
                num = (num / 1e4).toFixed(2) + '万'
            } else if (num < -1e8) {
                num = (num / 1e8).toFixed(2) + '亿'
            } else if (num < -1e4) {
                num = (num / 1e4).toFixed(2) + '万'
            } else {
                num = num.toFixed(2)
            }
        } else {
            if (num > 1e9) {
                num = (num / 1e9).toFixed(2) + 'B'
            } else if (num > 1e6) {
                num = (num / 1e6).toFixed(2) + 'M'
            } else if (num > 1e3) {
                num = (num / 1e3).toFixed(2) + 'K'
            } else if (num < -1e9) {
                num = (num / 1e9).toFixed(2) + 'B'
            } else if (num < -1e6) {
                num = (num / 1e6).toFixed(2) + 'M'
            } else if (num < -1e3) {
                num = (num / 1e3).toFixed(2) + 'K'
            } else {
                num = num.toFixed(2)
            }
        }
        return num
    },
    formatLittleValue(value, round=2) {
        try {
            if (g_lang === 'cn' && value < 1e4 || value < 1e3) {
                return Big(value).toFixed(round).toString()
            }
            return value
        } catch (e) {
            return value
        }
    },
    asyncLoadScript(url, callback) {
        let old_script = document.getElementById(url);
        if (old_script) {
            if (old_script.ready === true) {
                callback();
                return
            } else {
                document.body.removeChild(old_script)
            }
        }
        let script = document.createElement('script');
        script.id = url;
        script.src = url;
        script.onload = script.onreadystatechange = function() {
            if (script.ready) {
                return false
            }
            if (!script.readyState || script.readyState === 'loaded' || script.readyState === 'complete') {
                script.ready = true;
                callback()
            }
        }
        ;
        document.body.appendChild(script)
    },
    getTimeStr(value) {
        let date = new Date(value * 1e3);
        let hours = '0' + date.getHours();
        let minutes = '0' + date.getMinutes();
        let seconds = '0' + date.getSeconds();
        let formattedTime = hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        return formattedTime
    },
    formatDate(value) {
        let now = new Date(value * 1e3);
        var year = now.getFullYear();
        var month = '0' + (now.getMonth() + 1);
        var date = '0' + now.getDate();
        var hour = '0' + now.getHours();
        var minute = '0' + now.getMinutes();
        var second = '0' + now.getSeconds();
        return year + '-' + month.substr(-2) + '-' + date.substr(-2) + ' ' + hour.substr(-2) + ':' + minute.substr(-2) + ':' + second.substr(-2)
    },
    throttle(delay, fn, debounce_mode) {
        var last = 0, that = this, timeId;
        function wrapper() {
            var period = +new Date() - last
              , args = arguments;
            function exec() {
                last = +new Date();
                fn.apply(that, args)
            }
            function clear() {
                timeId = undefined
            }
            if (debounce_mode && !timeId) {
                exec()
            }
            timeId && clearTimeout(timeId);
            if (debounce_mode === undefined && period > delay) {
                exec()
            } else {
                timeId = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - period : delay)
            }
        }
        return wrapper
    },
    setPageTitle(latest_price_rate, currA, currB) {
        let t_symbol = this.get_currency_unitSymbol(currB)
          , price = this.transferToNumber(latest_price_rate)
          , symbolicon = GLOBAL_PRO_TRADE.lang == 'cn' ? '对' : '/';
        if (!is_bot) {
            document.title = `${t_symbol}${price} ${currA.toUpperCase()}${symbolicon}${currB.toUpperCase()} - ${price} ${currA.toUpperCase()} ${currB.toUpperCase()} · ${currA.toUpperCase()}/${currB.toUpperCase()} | Gate.io`
        }
    },
    skinName(type) {
        switch (Number(type)) {
        case 0:
            return {
                text: lang_string('亮色'),
                soft: 'light'
            };
        case 1:
            return {
                text: lang_string('传统黑'),
                soft: 'dark'
            };
        case 2:
            return {
                text: lang_string('高亮黑'),
                soft: 'light_dark'
            };
        default:
            return {
                text: lang_string('黑暗'),
                soft: 'dark'
            }
        }
    },
    getTheme() {
        return $.cookie('dark') && Number($.cookie('dark')) > 0 ? 1 : 0
    },
    getVolume(value) {
        value = parseFloat(value.replace(/,/g, ''));
        if (Number(value) >= 1e4) {
            if (is_cn)
                return `${(Number(value) / 1e4).toFixed(2)}万`;
            else {
                if (Number(value) <= 1e6) {
                    return `${(Number(value) / 1e3).toFixed(2)}K`
                } else
                    return `${(Number(value) / 1e6).toFixed(2)}M`
            }
        } else {
            return Number(value).toFixed(2)
        }
    },
    transferNum(num) {
        num = num.replace(/[^\d.]/g, '');
        const index = num.indexOf('.');
        if (index < 0 || index === num.length - 1)
            return num;
        else if (num.lastIndexOf('.') !== index)
            return num.substr(0, num.length - 1);
        else
            return num.substr(0, index + 6 + 1)
    },
    dealNumPrecision(tempNum, count=0) {
        if (tempNum === null || tempNum === undefined) {
            return ''
        }
        if (typeof tempNum === 'number' && tempNum.toString().indexOf('e') !== -1) {
            let tmpArray = tempNum.toString().match(/\d(?:\.(\d*))?e([+-]\d+)/);
            tempNum = tempNum.toFixed(Math.max(0, (tmpArray[1] || '').length - tmpArray[2]))
        }
        tempNum = tempNum.toString();
        const hasDecimal = tempNum.lastIndexOf('.') !== -1;
        if (count == 0) {
            tempNum = hasDecimal ? Number(tempNum.substring(0, tempNum.lastIndexOf('.'))) : tempNum
        } else {
            tempNum = hasDecimal ? tempNum.substring(0, tempNum.lastIndexOf('.') + (count + 1)) : tempNum
        }
        return tempNum
    },
    joinParams(params={}) {
        let paramsStr = '?';
        try {
            for (let key in params)
                paramsStr += `${key}=${params[key]}&`;
            paramsStr = paramsStr.substring(0, paramsStr.length - 1)
        } catch (error) {
            console.warn(`tradeTools -「joinParams」 warning: ${error}`);
            paramsStr = ''
        }
        return paramsStr
    },
    fnAddPoint(clickName, params={}) {
        if (window.collectEvent) {
            let _params = Object.prototype.toString.call(params) === '[object Object]' ? params : {
                button_name: params
            };
            window.collectEvent('beconEvent', clickName, _params)
        } else
            console.warn('collectEvent loading...')
    },
    saveLayoutData() {
        const breakpoints = [1366, 1440, 1600, 1920, 3400];
        const windowWidth = (document.body || document.documentElement).clientWidth;
        const index = breakpoints.findIndex(r=>r > windowWidth);
        getDataFromIndexedDB('proLayoutChangedSaved').then(res=>{
            const obj = res || {};
            obj[breakpoints[index]] = true;
            addDataToIndexDB('proLayoutChangedSaved', obj)
        }
        ).catch()
    },
    deleteLayoutData() {
        const breakpoints = [1366, 1440, 1600, 1920, 3400];
        const windowWidth = (document.body || document.documentElement).clientWidth;
        const index = breakpoints.findIndex(r=>r > windowWidth);
        getDataFromIndexedDB('proLayoutChangedSaved').then(res=>{
            const obj = res;
            if (!res)
                return;
            obj[breakpoints[index]] = false;
            addDataToIndexDB('proLayoutChangedSaved', obj)
        }
        ).catch()
    },
    async checkLayoutData() {
        try {
            const breakpoints = [1366, 1440, 1600, 1920, 3400];
            const res = await getDataFromIndexedDB('proLayoutChangedSaved');
            const windowWidth = (document.body || document.documentElement).clientWidth;
            const index = breakpoints.findIndex(r=>r > windowWidth);
            if (res && res[breakpoints[index]]) {
                return true
            } else {
                return false
            }
        } catch (e) {
            return false
        }
    }
};

export default tradeTools