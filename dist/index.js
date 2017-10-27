"use strict";
var plugins = require("./gulpfunction.plugins");
module.exports = function (functionsToExecuteArg, executionModeArg) {
    if (executionModeArg === void 0) { executionModeArg = 'forEach'; }
    //important vars
    var executionMode = executionModeArg; //can be forEach or atEnd
    var functionsToExecute = functionsToExecuteArg;
    var promiseArray = [];
    var runFunction = function (functionArg) {
        var returnValue = functionArg();
        if (typeof returnValue !== "undefined" && typeof returnValue.then !== "undefined") {
            promiseArray.push(returnValue);
        }
    };
    var checkAndRunFunction = function () {
        if (typeof functionsToExecute === "function") {
            runFunction(functionsToExecute);
        }
        else if (Array.isArray(functionsToExecute)) {
            for (var anyFunction in functionsToExecute) {
                runFunction(functionsToExecute[anyFunction]);
            }
        }
        else {
            throw new Error("gulp-callfunction: something is strange with the given arguments");
        }
        return plugins.Q.all(promiseArray);
    };
    var hasExecutedOnce = false;
    var forEach = function (file, enc, cb) {
        switch (executionMode) {
            case "forEach":
                checkAndRunFunction().then(function () {
                    cb(null, file);
                });
                break;
            case "forFirst":
                !hasExecutedOnce ? checkAndRunFunction().then(function () {
                    cb(null, file);
                }) : cb(null, file);
                hasExecutedOnce = true;
                break;
            case "atEnd":
                cb(null, file);
                break;
            default:
                break;
        }
    };
    var atEnd = function (cb) {
        if (executionMode === "atEnd") {
            checkAndRunFunction().then(function () {
                cb();
            });
        }
        else {
            cb();
        }
    };
    return plugins.through2.obj(forEach, atEnd);
};
