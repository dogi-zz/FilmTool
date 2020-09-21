
const splitName = (inputString) => {
    inputString = inputString.replace(/([A-Z]+)/g, ' $1');
    inputString = inputString.replace(/[^a-zA-Z0-9]/g, '  ');
    inputString = inputString.replace(/\s+/g, ' ');
    return inputString.split(' ').filter(part => part.length).map(part => part.toLowerCase());
}


exports.dashCase = (inputString) => {
    return splitName(inputString).join('-');
};

exports.snakeCase = (inputString) => {
    return splitName(inputString).join('_');
};

exports.camelCase = (inputString) => {
    return splitName(inputString).map(part => part.substr(0, 1).toUpperCase() + part.substr(1)).join('');
};
