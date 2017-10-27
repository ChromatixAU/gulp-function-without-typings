"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const through2 = require("through2");
let defaultExport = (functionsToExecuteArg, executionModeArg = 'forEach') => {
    let promiseArray = [];
    let runFunction = function (functionArg, file, enc) {
        let returnValue = functionArg(file, enc);
        if (typeof returnValue !== 'undefined' && typeof returnValue.then !== 'undefined') {
            promiseArray.push(returnValue);
        }
    };
    let checkAndRunFunction = function (file, enc) {
        if (typeof functionsToExecuteArg === 'function') {
            runFunction(functionsToExecuteArg, file, enc);
        }
        else if (Array.isArray(functionsToExecuteArg)) {
            for (let anyFunction in functionsToExecuteArg) {
                runFunction(functionsToExecuteArg[anyFunction], file, enc);
            }
        }
        else {
            throw new Error('gulp-callfunction: something is strange with the given arguments');
        }
        return Promise.all(promiseArray);
    };
    let hasExecutedOnce = false;
    let forEach = function (file, enc, cb) {
        switch (executionModeArg) {
            case 'forEach':
                checkAndRunFunction(file, enc).then(function () {
                    cb(null, file);
                });
                break;
            case 'forFirst':
                if (hasExecutedOnce) {
                    checkAndRunFunction(file, enc)
                        .then(function () {
                        cb(null, file);
                    });
                }
                else {
                    cb(null, file);
                }
                hasExecutedOnce = true;
                break;
            case 'atEnd':
                cb();
                break;
            default:
                break;
        }
    };
    let atEnd = function (cb) {
        if (executionModeArg === 'atEnd') {
            checkAndRunFunction(null, null).then(function () {
                cb();
            });
        }
        else {
            cb();
        }
    };
    return through2.obj(forEach, atEnd);
};
exports.forEach = (funcArg) => {
    return defaultExport(funcArg, 'forEach');
};
exports.forFirst = (funcArg) => {
    return defaultExport(funcArg, 'forFirst');
};
exports.atEnd = (funcArg) => {
    return defaultExport(funcArg, 'atEnd');
};
exports.default = defaultExport;
