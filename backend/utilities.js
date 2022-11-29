var ethereum_address = require('ethereum-address');

// Just a utility function
const toHex = (stringToConvert) =>stringToConvert.split('').map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');

const validateIndividualJson = data =>{
    const validPasswordLength = {min:8,max:30};
    const validNameLength = {min:2,max:20};
    let {metamaskId,name,birthdate,qualification,designation,documentList,password,rePassword} = data;

    if (!(metamaskId && name && birthdate && qualification && designation && documentList && password && rePassword)){
        return false;
    }
    // metamask id validation
    if (!ethereum_address.isAddress(metamaskId)) {
        return false;
    }

    //name validation
    if (name.length < validNameLength.min || name.length > validNameLength.max){
        return false;
    }

    //dob validation
    const currentYear = new Date().getFullYear();
    const validYears = {min:currentYear-100,max:currentYear-4};
    const {year,month,day} = birthdate.split("-");
    if (parseInt(year) < validYears.min || parseInt(year) > validYears.max){
        return false;
    }
    else if (parseInt(month) < 1 || parseInt(month) > 12 || parseInt)

    //password validation
    if (password.length < validPasswordLength.min || password.length > validPasswordLength.max){
        return false;
    }
    else if (password !== rePassword){
        return false;
    }
    
}

module.exports= {toHex, validateIndividualJson}