// Just a utility function
const toHex = (stringToConvert) =>stringToConvert.split('').map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');

module.exports({toHex})