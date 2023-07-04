const Calc = {
    Add: function (arg1, arg2) {
        arg1 = arg1.toString(),
            arg2 = arg2.toString();
        var arg1Arr = arg1.split(".")
            , arg2Arr = arg2.split(".")
            , d1 = arg1Arr.length == 2 ? arg1Arr[1] : ""
            , d2 = arg2Arr.length == 2 ? arg2Arr[1] : "";
        var maxLen = Math.max(d1.length, d2.length);
        var m = Math.pow(10, maxLen);
        var result = Number(((arg1 * m + arg2 * m) / m).toFixed(maxLen));
        var d = arguments[2];
        return typeof d === "number" ? Number(result.toFixed(d)) : result
    },
    Sub: function (arg1, arg2) {
        return Calc.Add(arg1, '-' + arg2, arguments[2])
    },
    Mul: function (arg1, arg2) {
        if (!arg1 || !arg2) {
            return 0
        }
        var r1 = arg1.toString(), r2 = arg2.toString(), m, resultVal, d = arguments[2];
        m = (r1.split(".")[1] ? r1.split(".")[1].length : 0) + (r2.split(".")[1] ? r2.split(".")[1].length : 0);
        resultVal = Number(r1.replace(".", "")) * Number(r2.replace(".", "")) / Math.pow(10, m);
        return typeof d !== "number" ? Number(resultVal) : Number(resultVal.toFixed(parseInt(d)))
    },
    Div: function (arg1, arg2) {
        if (!arg1 || !arg2) {
            return 0
        }
        if (arg2 == 0) {
            return 0
        }
        var r1 = arg1.toString(), r2 = arg2.toString(), m, resultVal, d = arguments[2];
        m = (r2.split(".")[1] ? r2.split(".")[1].length : 0) - (r1.split(".")[1] ? r1.split(".")[1].length : 0);
        resultVal = Number(r1.replace(".", "")) / Number(r2.replace(".", "")) * Math.pow(10, m);
        return typeof d !== "number" ? Number(resultVal) : Number(resultVal.toFixed(parseInt(d)))
    }
};
Number.prototype.add = function (arg) {
    var r1, r2, m;
    try {
        r1 = this.toString().split(".")[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = arg.toString().split(".")[1].length
    } catch (e) {
        r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2));
    return (this * m + arg * m) / m
}
    ;
Number.prototype.sub = function (arg) {
    return this.add(-arg)
}
    ;
Number.prototype.mul = function (arg) {
    var m = 0
        , s1 = this.toString()
        , s2 = arg.toString();
    try {
        m += s1.split(".")[1].length
    } catch (e) { }
    try {
        m += s2.split(".")[1].length
    } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

export {
    Calc
}