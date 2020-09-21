const path = require('path');
const {ConsoleReporter} = require('jasmine');


const splitName = (inputString) => {
    inputString = inputString.replace(/([A-Z]+)/g, ' $1');
    inputString = inputString.replace(/[^a-zA-Z0-9]/g, '  ');
    inputString = inputString.replace(/\s+/g, ' ');
    return inputString.split(' ').filter(part => part.length).map(part => part.toLowerCase());
}


exports.dashCase = (inputString, args) => {
    return splitName(inputString).join('-');
};

exports.snakeCase = (inputString, args) => {
    return splitName(inputString).join('_');
};

exports.camelCase = (inputString, args) => {
    return splitName(inputString).map(part => part.substr(0, 1).toUpperCase() + part.substr(1)).join('');
};

exports.relativePath = (inputString, args) => {
    const fileDir = path.dirname(args._filePath_);
    const toDir = path.dirname(inputString);
    let relPath = path.relative(fileDir, toDir);
    if (relPath === '') {relPath = '.';}
    relPath += '/';

    let moduleName = path.basename(inputString);
    if (moduleName.endsWith('.ts')) {moduleName = moduleName.substr(0, moduleName.length - '.ts'.length);}

    return relPath + moduleName;
};

